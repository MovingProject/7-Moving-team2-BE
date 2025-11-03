export interface OAuthUser {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    provider: string;
  };
}

export interface OAuthRequest extends Request {
  user: OAuthUser;
}
