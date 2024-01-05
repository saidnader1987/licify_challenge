import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, Subscription, forkJoin, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user';
import { Project, ProjectConstructor } from '../../../models/project';
import { ProjectService } from '../../../services/project.service';
import { ResponseHTTP } from '../../../interfaces/response';
import { ToastrService } from 'ngx-toastr';
import { Quotation } from '../../../models/quotation';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment';
import { customFormatCurrency } from '../../../utils/customFormatCurrency';
import { customFormatNumber } from '../../../utils/customFormatNumber';
import { customFormatDate } from '../../../utils/customFormatDate';
import { Item } from '../../../models/item';
import { QuotationService } from '../../../services/quotation.service';
import { TruncateText } from '../../../pipes/truncate-text.pipe';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { cleanNumberInputMask } from '../../../utils/clearNumberInputMask';
import { OnlyNumbersAndDecimalsDirective } from '../../../directives/only-numbers-and-decimals.directive';
import { CurrencyMaskDirective } from 'ng2-currency-mask';
import { CurrencyMaskWithDecimalsDirective } from '../../../directives/currency-mask-with-decimals.directive';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    RouterLink,
    NgFor,
    TruncateText,
    ReactiveFormsModule,
    OnlyNumbersAndDecimalsDirective,
    CurrencyMaskWithDecimalsDirective,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  @ViewChild('quotationList') quotationList!: ElementRef;

  projectId!: string;
  imageUrl = environment.localAssetsUrl;
  private destroy$ = new Subject<void>();
  private userSubscription!: Subscription;
  userRole!: UserRole;
  project!: Project;
  quotations: Array<Quotation> = [];
  loadedQuotation: Quotation | undefined;
  customFormatCurrency: Function = customFormatCurrency;
  customFormatNumber: Function = customFormatNumber;
  customFormatDate: Function = customFormatDate;
  quotationListOpened = false;
  quotationForm!: FormGroup;
  supplierId: string | undefined;
  projectConstructor!: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private projectService: ProjectService,
    private quotationService: QuotationService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.getProjectId();
    this.initQuotationForm();
    if (this.projectId) {
      this.setUserSubscriptionAndGetQuotations();
    }
  }

  get displayQuotationLayout() {
    return this.loadedQuotation !== undefined || this.isQuoteMode;
  }

  get isQuoteMode() {
    return this.userRole === 'proveedor' && this.loadedQuotation === undefined;
  }

  get itemsFormArray() {
    return this.quotationForm.get('items') as FormArray;
  }

  setUserSubscriptionAndGetQuotations() {
    this.userSubscription = this.authService.user
      .pipe(
        takeUntil(this.destroy$),
        switchMap((user) => {
          this.userRole = user?.role as UserRole;
          this.supplierId =
            this.userRole === 'proveedor' && user?._id ? user._id : undefined;

          const quotations$ =
            this.userRole === 'proveedor' && user?._id
              ? this.getProjectQuotationOfSupplier(this.projectId, user?._id)
              : this.getAllProjectQuotations(this.projectId);
          const projectInfo$ = this.getProjectInfo(this.projectId);
          return forkJoin([quotations$, projectInfo$]);
        })
      )
      .subscribe({
        next: ([quotationsRes, projectRes]) => {
          if (quotationsRes.data) {
            this.quotations = quotationsRes.data;
            if (this.userRole === 'proveedor') {
              this.loadedQuotation = quotationsRes.data[0];
            }
          }
          if (projectRes.data) {
            this.project = projectRes.data;
            this.projectConstructor = (
              projectRes.data.projectConstructor as ProjectConstructor
            ).company;
            if (this.project.items) {
              this.initQuotationFormWithItems(this.project.items);
              if (this.loadedQuotation) this.populateQuotedPriceFields();
            }
          }
        },
        error: (error) => {
          this.toastr.error(error.error.message);
          this.router.navigate(['/']);
        },
      });
  }

  getProjectInfo(projectId: string) {
    return this.projectService.getProject(this.projectId);
  }

  getProjectId() {
    this.projectId =
      this.activatedRoute.snapshot.paramMap.get('projectId') ?? '';
  }

  getAllProjectQuotations(projectId: string) {
    return this.quotationService.getAllProjectQuotations(projectId);
  }

  getProjectQuotationOfSupplier(projectId: string, userId: string) {
    return this.quotationService.getProjectQuotationOfSupplier(
      projectId,
      userId
    );
  }

  createQuotation() {
    const formData = this.quotationForm.value;

    const preparedData = {
      supplier: this.supplierId ?? '',
      project: this.projectId,
      items: formData.items.map((item: any) => ({
        item: item.item,
        quotedPrice: cleanNumberInputMask(item.quotedPrice),
      })),
    };

    this.quotationService.createQuotation(preparedData).subscribe({
      next: (res: ResponseHTTP<Quotation>) => {
        this.toastr.success('Cotización creada exitósamente');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  initQuotationForm() {
    this.quotationForm = this.formBuilder.group({
      items: this.formBuilder.array([], Validators.required),
    });
  }

  initQuotationFormWithItems(items: Item[]) {
    const formArray = this.formBuilder.array(
      items.map((item) => this.createItemGroup(item))
    );
    this.quotationForm.setControl('items', formArray);
  }

  createItemGroup(item: Item): FormGroup {
    return this.formBuilder.group({
      item: [item._id, Validators.required],
      quotedPrice: [
        { value: null, disabled: !this.isQuoteMode },
        [Validators.required, this.validationService.validateGreaterThanZero],
      ],
    });
  }

  populateQuotedPriceFields() {
    if (this.loadedQuotation) {
      this.itemsFormArray.controls.forEach((control) => {
        const itemId = control?.get('item')?.value;
        const itemQuotation = this.loadedQuotation!!.items.find(
          (item) => item.item._id === itemId
        );
        if (itemQuotation) {
          control
            .get('quotedPrice')
            ?.setValue(
              customFormatCurrency(itemQuotation.quotedPrice, 'en-US', 'USD'),
              {
                emitEvent: false,
                onlySelf: true,
              }
            );
        }
      });
    }
  }

  calculateSubtotal(item: Item | undefined): string | null {
    if (!item) return null;
    const quantity = item.quantity.toString();
    const price = item.price.toString();
    if (quantity && price) {
      return customFormatCurrency(
        cleanNumberInputMask(quantity) * cleanNumberInputMask(price),
        'en-US',
        'USD'
      );
    } else {
      return null;
    }
  }

  calculateQuotedSubtotal(controlIndex: number): string | null {
    const control = this.itemsFormArray.at(controlIndex) as FormGroup;
    const itemId = control.get('item')?.value;

    if (this.project.items) {
      const matchingItem = this.project.items.find(
        (item) => item._id === itemId
      );
      if (!matchingItem) {
        return null;
      }

      const quotedPrice = control.get('quotedPrice')?.value;
      const quantity = matchingItem.quantity.toString();
      if (quantity && quotedPrice) {
        return customFormatCurrency(
          cleanNumberInputMask(quantity) * cleanNumberInputMask(quotedPrice),
          'en-US',
          'USD'
        );
      } else {
        return null;
      }
    }
    return null;
  }

  toggleQuotationListMenu() {
    this.quotationListOpened = !this.quotationListOpened;
  }

  loadQuotation(index: number) {
    this.quotationListOpened = false;
    this.loadedQuotation = this.quotations[index];
    this.populateQuotedPriceFields();
  }

  unloadQuotation() {
    this.loadedQuotation = undefined;
  }

  get projectTotal(): string {
    if (this.project?.items) {
      const total = this.project?.items.reduce((acc, item) => {
        const price = cleanNumberInputMask(item.price || '0');
        const quantity = cleanNumberInputMask(item.quantity || '0');
        return acc + price * quantity;
      }, 0);
      return customFormatCurrency(total, 'en-US', 'USD');
    }
    return customFormatCurrency(0, 'en-US', 'USD');
  }

  get quotationTotal(): string {
    if (this.project?.items) {
      const total = this.itemsFormArray.controls.reduce((acc, control) => {
        const itemId = control.get('item')?.value;

        const matchingItem = this.project.items!!.find(
          (item) => item._id === itemId
        );
        if (!matchingItem) {
          return acc;
        }

        const quotedPriceValue = control.get('quotedPrice')?.value ?? 0;
        const quotedPrice = quotedPriceValue
          ? +cleanNumberInputMask(quotedPriceValue)
          : 0;

        const quantityValue = matchingItem.quantity ?? 0;
        const quantity = quantityValue
          ? +cleanNumberInputMask(quantityValue.toString())
          : 0;

        return acc + quotedPrice * quantity;
      }, 0);
      return customFormatCurrency(total, 'en-US', 'USD');
    }
    return customFormatCurrency(0, 'en-US', 'USD');
  }

  @HostListener('document:keydown.escape', ['$event']) onEscapeKeydownHandler(
    event: KeyboardEvent
  ) {
    this.quotationListOpened = false;
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    if (
      this.quotationList &&
      !this.quotationList.nativeElement.contains(event.target)
    ) {
      this.quotationListOpened = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
