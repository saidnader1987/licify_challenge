import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { UserRole } from '../../../models/user';
import { AuthService } from '../../../services/auth.service';
import { ProjectService } from '../../../services/project.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { ValidationService } from '../../../services/validation.service';
import { Project } from '../../../models/project';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { CurrencyMaskWithDecimalsDirective } from '../../../directives/currency-mask-with-decimals.directive';
import { OnlyNumbersAndDecimalsDirective } from '../../../directives/only-numbers-and-decimals.directive';
import { NumberMaskWithDecimalsDirective } from '../../../directives/number-mask.directive';
import { customFormatCurrency } from '../../../utils/customFormatCurrency';
import { cleanNumberInputMask } from '../../../utils/clearNumberInputMask';
import { ResponseHTTP } from '../../../interfaces/response';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
    NgFor,
    CurrencyMaskWithDecimalsDirective,
    OnlyNumbersAndDecimalsDirective,
    NumberMaskWithDecimalsDirective,
    RouterLink,
  ],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css'],
})
export class ProjectCreateComponent implements OnInit, OnDestroy {
  @ViewChildren('fileInputRef') fileInputs!: QueryList<ElementRef>;

  private destroy$ = new Subject<void>();
  private userSubscription!: Subscription;
  images: Array<File | null> = [null, null, null];
  projectForm!: FormGroup;
  userRole!: UserRole;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private toastr: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    this.setUserSubscription();
    this.initForm();
  }

  setUserSubscription() {
    this.userSubscription = this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.userRole = user?.role as UserRole;
        if (this.userRole !== 'constructor') {
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.projectForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        startDate: [
          '',
          [Validators.required, this.validationService.validDate],
        ],
        endDate: ['', [Validators.required, this.validationService.validDate]],
        items: this.formBuilder.array([], Validators.required),
      },
      { validators: this.validationService.validateDateRange }
    );
    this.addItem();
  }

  get items(): FormArray {
    return this.projectForm.get('items') as FormArray;
  }

  get canDisplayLabels() {
    return this.items.length !== 0;
  }

  get projectTotal(): string {
    const total = this.items.controls.reduce((acc, item) => {
      const price = cleanNumberInputMask(item.get('price')?.value || '0');
      const quantity = cleanNumberInputMask(item.get('quantity')?.value || '0');
      return acc + price * quantity;
    }, 0);
    return customFormatCurrency(total, 'en-US', 'USD');
  }

  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadImageAtIndex(index, file);
    }
  }

  uploadImageAtIndex(index: number, file: File): void {
    this.images[index] = file;
  }

  removeImageAtIndex(index: number): void {
    this.images[index] = null;
    const fileInputRefs = this.fileInputs.toArray();
    if (fileInputRefs[index]) {
      fileInputRefs[index].nativeElement.value = '';
    }
  }

  addItem(): void {
    const itemForm = this.formBuilder.group({
      description: ['', Validators.required],
      quantity: [
        '',
        [Validators.required, this.validationService.validateGreaterThanZero],
      ],
      quantityUnit: ['', Validators.required],
      price: [
        '',
        [Validators.required, this.validationService.validateGreaterThanZero],
      ],
    });
    this.items.push(itemForm);
  }

  deleteItem(index: number) {
    this.items.removeAt(index);
  }

  calculateSubtotal(index: number): string | null {
    const item = this.items.at(index) as FormGroup;
    const quantityControl = item.get('quantity');
    const priceControl = item.get('price');

    const quantity = quantityControl?.value;
    const price = priceControl?.value;

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

  prepareProjectData(): FormData {
    const formData = new FormData();

    // Basic info
    Object.keys(this.projectForm.value).forEach((key) => {
      if (key !== 'items' && this.projectForm.get(key)) {
        formData.append(key, this.projectForm.get(key)?.value);
      }
    });

    // Items
    this.items.controls.forEach((item, index) => {
      if (item.valid) {
        formData.append(
          `items[${index}][description]`,
          item.get('description')?.value
        );

        formData.append(
          `items[${index}][quantity]`,
          cleanNumberInputMask(item.get('quantity')?.value).toString()
        );
        formData.append(
          `items[${index}][quantityUnit]`,
          item.get('quantityUnit')?.value
        );
        formData.append(
          `items[${index}][price]`,
          cleanNumberInputMask(item.get('price')?.value).toString()
        );
      }
    });

    // Images
    this.images.forEach((image, index) => {
      if (image) {
        formData.append('images', image, image.name);
      }
    });

    return formData;
  }

  createProject() {
    const projectData = this.prepareProjectData();

    this.projectService.createProject(projectData).subscribe({
      next: (res: ResponseHTTP<Project>) => {
        this.toastr.success('Proyecto creado exitósamente');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }
}
