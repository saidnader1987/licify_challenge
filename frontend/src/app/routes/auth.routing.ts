import { Route } from '@angular/router';
import { LoginComponent } from '../components/auth/login/login.component';
import { SignupComponent } from '../components/auth/signup/signup.component';
import { AuthComponent } from '../components/auth/auth.component';

export const AUTH_ROUTES: Route[] = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
    ],
  },
];
