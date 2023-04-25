import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from "@angular/common/http";
import { Router } from "@angular/router";

import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "./ApiService";
import { CommonService } from "../../providers/services/CommonService";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    public app: ApiService,
    private common: CommonService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tokenData = localStorage.getItem("AdminData");
    if (tokenData) {
      let userData = JSON.parse(tokenData).user_data;

      request = request.clone({
        setHeaders: {
          Authorization: "Bearer " + userData.accessToken,
        },
      });
    }

    if (!request.headers.has("Content-Type")) {
      request = request.clone({
        setHeaders: {
          "content-type": "application/json",
        },
      });
    }

    request = request.clone({
      headers: request.headers.set("Accept", "application/json"),
    });

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.statusText == "Unauthorized") {
          localStorage.clear();
          this.router.navigate(["login"]);
        }
        return throwError(err);
      })
    );
  }
}
