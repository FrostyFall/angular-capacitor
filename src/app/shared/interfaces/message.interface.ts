import { IUser } from './user.interface';

export interface IMessage {
  id: number;
  message: string;
  type: string;
  roomId: number;

  senderName?: string;
  user?: IUser;
}
