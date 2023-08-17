export interface IAuthResponse {
  accessToken: {
    token: string;
    expiresIn: number;
  };
  id: number;
  firstName: string;
  lastName: string;
}
