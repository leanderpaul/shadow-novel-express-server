import type { User } from '@leanderpaul/shadow-novel-database';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface Login {
  body: {
    username: string;
    password: string;
  };
  response: AuthResponse;
}

export interface Register {
  body: {
    username: string;
    password: string;
  };
  response: AuthResponse;
}

export interface VerifySession {
  body: {
    token: string;
  };
  response: AuthResponse;
}
