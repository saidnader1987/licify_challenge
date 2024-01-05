import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user';
import { ResponseHTTP } from '../interfaces/response';
import { environment } from '../environments/environment';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<User | null>(null);
  private tokenExpirarionTimer!: any;
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  signup(registeringUser: User) {
    return this.http
      .post<ResponseHTTP<User>>(this.apiUrl + 'users/signup', registeringUser)
      .pipe(
        tap((res) => {
          if (res.status === 'success' && res.token && res.data) {
            this.handleAuthentication(res.data, res.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<ResponseHTTP<User>>(this.apiUrl + 'users/login', {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          if (res.status === 'success' && res.token && res.data) {
            this.handleAuthentication(res.data, res.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  autoLogin() {
    if (!localStorage.getItem('userData')) return;
    const userData = JSON.parse(localStorage.getItem('userData')!!);

    if (!userData) return;

    const loadedUser = new User(
      userData.email,
      userData._id,
      userData.role,
      userData.name,
      userData.company,
      undefined,
      undefined,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );
    // check for valid token
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirarionTimer = setTimeout(
      () => this.logout(),
      expirationDuration
    );
  }

  logout() {
    this.router.navigate(['/auth/login']).then(() => {
      this.user.next(null);
      localStorage.removeItem('userData');
      if (this.tokenExpirarionTimer) {
        clearTimeout(this.tokenExpirarionTimer);
      }
      this.tokenExpirarionTimer = null;
    });
  }

  private handleAuthentication(userData: any, token: string) {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      console.error('Invalid token');
      return;
    }

    const expirationDate = new Date(decodedToken.exp * 1000);
    const user = new User(
      userData.email,
      userData._id,
      userData.role,
      userData.name,
      userData.company,
      undefined,
      undefined,
      token,
      expirationDate
    );

    this.user.next(user);
    this.autoLogout(expirationDate.getTime() - new Date().getTime());
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(error: any) {
    const errorMessage = error.error.message || 'Ocurrió un error inesperado';
    return throwError(() => new Error(errorMessage));
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
}
