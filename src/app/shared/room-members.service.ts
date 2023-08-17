import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment.development';
import { Observable, switchMap } from 'rxjs';
import { IRoomMember } from './interfaces/room-member.interface';

@Injectable({ providedIn: 'root' })
export class RoomMembersService {
  private apiService = inject(ApiService);

  // getMember()

  getMembers(roomId: number): Observable<IRoomMember[]> {
    return this.apiService.get(
      `${environment.apiUrl}/room-members?roomId=${roomId}`
    );
  }

  createMember(userId: number, roomId: number) {
    return this.apiService.post(`${environment.apiUrl}/room-members`, {
      userId,
      roomId,
    });
  }

  removeMember(userId: number, roomId: number) {
    return this.apiService
      .get<IRoomMember[]>(
        `${environment.apiUrl}/room-members/?userId=${userId}&roomId=${roomId}`
      )
      .pipe(
        switchMap((member) => {
          const { id } = member[0];

          return this.apiService.delete(
            `${environment.apiUrl}/room-members/${id}`
          );
        })
      );
  }
}
