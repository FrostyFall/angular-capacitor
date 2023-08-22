import { Injectable } from '@angular/core';

import { IStorage } from './interfaces/storage.interface';

@Injectable({ providedIn: 'root' })
export class SessionStorageService implements IStorage {
  public get(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  public set(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  public remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  public clear(): void {
    sessionStorage.clear();
  }
}
