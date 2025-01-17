import { Injectable } from '@angular/core';
import { AuthenticationService, Configuration, AuthData } from 'src/oversigt-client';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';

const USER_NAME = 'user.name';
const USER_ID = 'user.id';
const USER_TOKEN = 'user.token';
const USER_ROLES = 'user.roles';
const CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private __name: string = null;
  private __userid: string = null;
  private __token: string = null;
  private __roles: string[] = [];

  private _requestedUrl: string = null;

  private _checked = false;
  private _polling = false;

  constructor(
    private authentication: AuthenticationService,
    private configuration: Configuration,
    private notification: NotificationService,
    private router: Router,
    private errorHandler: ErrorHandlerService,
  ) {
    this.__userid = localStorage.getItem(USER_ID);
    this.__name = localStorage.getItem(USER_NAME);
    this.__token = localStorage.getItem(USER_TOKEN);
    this.__roles = JSON.parse(localStorage.getItem(USER_ROLES));
  }

  isLoggedIn(): boolean | Observable<boolean> {
    if (this._checked) {
      // if we already check we can answer now
      const loggedIn = this.token !== null && this.token !== '';
      if (loggedIn) {
        this.scheduleTokenValidityCheck();
      }
      return loggedIn;
    } else {
      if (this.token === null || this.token === undefined || this.token === '') {
        // if we have no token, it's also obvious that we're not logged in
        return false;
      } else {
        // otherwise we need to check the token
        return new Observable<boolean>(observer => {
          this.authentication.checkToken(this.token).subscribe(
            ok => {
              this.relogIn();
              observer.next(ok);
              this.scheduleTokenValidityCheck();
            }, error => {
              this.logOut();
              observer.error(error);
            },
            () => {
              observer.complete();
              this._checked = true;
            }
          );
        });
      }
    }
  }

  private scheduleTokenValidityCheck(): void {
    // prevent multiple polling loops
    if (this._polling) {
      return;
    }

    this._polling = true;
    setTimeout(() => {
      this._polling = false;
      this.checkTokenValidity().then(stillValid => {
        if (stillValid) { // stop checking if the token is invalid
          console.log('Token is still valid.');
          this.scheduleTokenValidityCheck();
          this.renewToken();
        } else {
          console.log('Token is not valid any more. Logging out.');
          this.logOut();
          this.router.navigateByUrl('/login');
          this.notification.warning('You have been logged out.');
        }
      });
    }, CHECK_INTERVAL);
  }

  private checkTokenValidity(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authentication.checkToken(this.token).subscribe(
        valid => {
          resolve(valid);
        },
        error => {
          console.log('Error while checking token validity', error);
          resolve(false);
        }
      );
    });
  }

  reloadRoles(): void {
    this.authentication.getRoles().subscribe(
      authData => {
        this.setAuthData(authData);
      },
      this.errorHandler.createErrorHandler('Reload roles')
    );
  }

  getName(): string {
    return this.name;
  }

  getUserId(): string {
    return this.userid;
  }

  private get name(): string {
    return this.__name;
  }

  private set name(name: string) {
    this.__name = name;
    localStorage.setItem(USER_NAME, name);
  }

  private get userid(): string {
    return this.__userid;
  }

  private set userid(userid: string) {
    this.__userid = userid;
    localStorage.setItem(USER_ID, userid);
  }

  private get token(): string {
    return this.__token;
  }

  private set token(token: string) {
    this.__token = token;
    localStorage.setItem(USER_TOKEN, token);
  }

  private get roles(): string[] {
    return this.__roles;
  }

  private set roles(roles: string[]) {
    this.__roles = roles;
    localStorage.setItem(USER_ROLES, JSON.stringify(roles));
  }

  get requestedUrl(): string {
    if (this._requestedUrl === null || this._requestedUrl.length === 0) {
      return '/';
    } else {
      return this._requestedUrl;
    }
  }

  set requestedUrl(url: string) {
    this._requestedUrl = url;
  }

  public logIn(username: string, password: string, success: (name: string) => void, fail: () => void): void {
    this.authentication.authenticateUser(username, password).subscribe(
      ok => {
        this.setAuthData(ok);
        console.log('Logged in.', 'User name', ok.displayName, 'Roles', ok.roles);
        success(ok.displayName);
        this.scheduleTokenValidityCheck();
      },
      this.errorHandler.createZeroHandler(message => {
        this.notification.error('Login failed: ' + message);
        fail();
      })
    );
  }

  public logOut() {
    this.token = '';
    this.name = '';
    this.userid = '';
    this.roles = [];
  }

  private relogIn(): void {
    console.log('re-login');
    this.setAuthData({userId: this.userid, token: this.token, displayName: this.name, roles: this.roles});
  }

  private setAuthData(data: AuthData): void {
    this.token = data.token;
    this.name = data.displayName;
    this.roles = data.roles;
    this.userid = data.userId;

    const authorization = 'Bearer ' + data.token;
    this.configuration.apiKeys['Authorization'] = authorization;
  }

  private renewToken(): void {
    this.authentication.renewToken(this.token).subscribe(
      ok => {
        console.log('New token received');
        this.setAuthData(ok);
      }, error => {
        console.error('Error while refreshing token.', error);
        // TODO: handle error
      }
    );
  }

  hasRole(roleName: string): boolean {
    return this.roles !== null && this.roles.includes(roleName);
  }
}
