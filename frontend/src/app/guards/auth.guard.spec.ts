import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: any;
  let router: any;

  beforeEach(() => {
    authService = { isLoggedIn: jasmine.createSpy().and.returnValue(true) };
    router = { navigate: jasmine.createSpy() };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('permite acceso si está logueado', () => {
    expect(guard.canActivate()).toBeTrue();
  });

  it('redirige al login si no está logueado', () => {
    authService.isLoggedIn.and.returnValue(false);
    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
