import type { User } from '@leanderpaul/shadow-novel-database';

import type { ErrorResponse } from '../../typescript/index';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface Login {
  body: {
    username: string;
    password: string;
  };
  response: AuthResponse | ErrorResponse;
}

export interface Register {
  body: {
    username: string;
    password: string;
  };
  response: AuthResponse;
}
