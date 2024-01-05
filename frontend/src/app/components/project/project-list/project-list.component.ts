import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, of, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { ToastrService } from 'ngx-toastr';
import { Project } from '../../../models/project';
import { NgFor, NgIf } from '@angular/common';
import { ResponseHTTP } from '../../../interfaces/response';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private userSubscription!: Subscription;
  imageUrl = environment.localAssetsUrl;
  userName = '';
  userRole!: UserRole;
  projects: Array<Project> = [];
  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.setUserSubscriptionAndGetProjects();
  }

  setUserSubscriptionAndGetProjects() {
    this.userSubscription = this.authService.user
      .pipe(
        takeUntil(this.destroy$),
        switchMap((user) => {
          this.userName = user?.name || '';
          this.userRole = user?.role as UserRole;
          if (this.userRole === 'constructor' && user?._id) {
            return this.getAllProjectsFromUser(user?._id);
          } else {
            return this.getAllProjects();
          }
        })
      )
      .subscribe({
        next: (res: ResponseHTTP<Project[]>) => {
          this.projects = res.data || [];
        },
        error: (error) => {
          this.toastr.error(error.error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllProjects() {
    return this.projectService.getAllProjects();
  }

  getAllProjectsFromUser(userId: string) {
    return this.projectService.getAllProjectsFromUser(userId);
  }
}
