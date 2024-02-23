import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private http: HttpClient,
  ) { }

  public getJsonData(): Observable<any> {
      return this.http.get<any>(environment.data).pipe(
        catchError(error => {
          // Handle and optionally transform error before throwing
          return throwError(() => new Error('Error fetching data'));
        })
      );
  }
}
