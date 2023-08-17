import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment.development';
import { IRoom } from './interfaces/room.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomsService {
  private apiService = inject(ApiService);

  private roomSource = new BehaviorSubject<IRoom | null>(null);
  public room$ = this.roomSource.asObservable();

  setRoom(room: IRoom) {
    this.roomSource.next(room);
  }

  getRoom(): IRoom | null {
    return this.roomSource.getValue();
  }

  create(name: string) {
    return this.apiService.post<IRoom>(`${environment.apiUrl}/rooms`, { name });
  }

  getByName(name: string) {
    return this.apiService.get<IRoom>(
      `${environment.apiUrl}/rooms?name=${name}`
    );
  }
}
