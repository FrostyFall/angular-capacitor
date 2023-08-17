import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get(key: string) {
    return sessionStorage.getItem(key);
  }

  set(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  remove(key: string) {
    sessionStorage.removeItem(key);
  }

  clear() {
    sessionStorage.clear();
  }
}
