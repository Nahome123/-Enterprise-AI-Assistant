export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface AuthToken {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}
