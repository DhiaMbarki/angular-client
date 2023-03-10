import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '@auth/services/auth.service';
import { AuthInterceptor } from './auth-interceptor';
import { AuthFacade } from '../services/auth.facade.service';
import { GlobalFacade } from '~/app/store/effects/global.facade';

describe('AuthIntercepter', () => {
  const testData = { name: 'Test Data' };
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceSpy: AuthService;
  let authFacade: AuthFacade;
  let globalFacade: GlobalFacade;
  const authSpy = { getAuthorizationToken: jest.fn() };
  const authFacadeSpy = { logout: jest.fn() };
  const globalFacadeSpy = { displayNotification: jest.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        { provide: AuthService, useValue: authSpy },
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: GlobalFacade, useValue: globalFacadeSpy }
      ]
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    authServiceSpy = TestBed.get(AuthService);
    authFacade = TestBed.get(AuthFacade);
    globalFacade = TestBed.get(GlobalFacade);
  });

  it('should add a Bearer token to the Authorization header of all outgoing request', () => {
    const token = 'TOKEN';
    const spy = (authServiceSpy.getAuthorizationToken = jest.fn(() => token));

    const someData = { data: 'someData ' };

    // Make an HTTP GET request
    httpClient.get('/test').subscribe(data => {
      // When observable resolves, result should match test data
      expect(data).toEqual(someData);
    });

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne('/test');

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    expect(req.request.headers.get('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${token}`);
    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(someData);

    // Finally, assert that there are no outstanding requests.
    httpTestingController.verify();
  });
});
