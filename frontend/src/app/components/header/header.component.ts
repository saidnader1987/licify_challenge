import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private userSubscription!: Subscription;
  isAuthenticated = false;
  userCompany = '';
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.setUserSubscription();
  }

  setUserSubscription() {
    this.userSubscription = this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.isAuthenticated = !user ? false : true;
        this.userCompany = user?.company || '';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogOut() {
    this.authService.logout();
  }
}
