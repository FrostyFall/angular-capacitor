import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from './api.service';
import { environment } from 'src/environments/environment.development';
import { IRoom } from './interfaces/room.interface';

@Injectable({ providedIn: 'root' })
export class RoomsService {
  private readonly apiService = inject(ApiService);

  private roomSource = new BehaviorSubject<IRoom | null>(null);
  public room$ = this.roomSource.asObservable();

  public setRoom(room: IRoom): void {
    this.roomSource.next(room);
  }

  public getRoom(): IRoom | null {
    return this.roomSource.getValue();
  }

  public create(name: string): Observable<IRoom> {
    return this.apiService.post<IRoom>(`${environment.apiUrl}/rooms`, { name });
  }

  public getByName(name: string): Observable<IRoom> {
    return this.apiService.get<IRoom>(
      `${environment.apiUrl}/rooms?name=${name}`
    );
  }
}
