import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly httpClient = inject(HttpClient);

  public get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(url);
  }

  public post<T>(url: string, body: any): Observable<T> {
    return this.httpClient.post<T>(url, body);
  }

  public patch<T>(url: string, body: any): Observable<T> {
    return this.httpClient.patch<T>(url, body);
  }

  public delete<T>(url: string): Observable<T> {
    return this.httpClient.delete<T>(url);
  }
}
