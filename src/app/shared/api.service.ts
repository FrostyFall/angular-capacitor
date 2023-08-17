import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private httpClient = inject(HttpClient);

  get<T>(url: string) {
    return this.httpClient.get<T>(url);
  }

  post<T>(url: string, body: any) {
    return this.httpClient.post<T>(url, body);
  }

  patch(url: string, body: any) {
    return this.httpClient.patch(url, body);
  }

  delete(url: string) {
    return this.httpClient.delete(url);
  }
}
