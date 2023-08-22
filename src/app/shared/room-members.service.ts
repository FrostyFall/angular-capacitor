import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import { ApiService } from './api.service';
import { environment } from 'src/environments/environment.development';
import { IRoomMember } from './interfaces/room-member.interface';

@Injectable({ providedIn: 'root' })
export class RoomMembersService {
  private readonly apiService = inject(ApiService);

  public getMembers(roomId: number): Observable<IRoomMember[]> {
    return this.apiService.get(
      `${environment.apiUrl}/room-members?roomId=${roomId}`
    );
  }

  public createMember(userId: number, roomId: number): Observable<IRoomMember> {
    return this.apiService.post<IRoomMember>(
      `${environment.apiUrl}/room-members`,
      {
        userId,
        roomId,
      }
    );
  }

  public removeMember(userId: number, roomId: number): Observable<IRoomMember> {
    return this.apiService
      .get<IRoomMember[]>(
        `${environment.apiUrl}/room-members/?userId=${userId}&roomId=${roomId}`
      )
      .pipe(
        switchMap((member) => {
          const { id } = member[0];

          return this.apiService.delete<IRoomMember>(
            `${environment.apiUrl}/room-members/${id}`
          );
        })
      );
  }
}
