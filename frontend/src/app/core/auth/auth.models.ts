export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
