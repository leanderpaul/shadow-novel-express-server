import type { User } from '@leanderpaul/shadow-novel-database';

export interface GetProfile {
  response: Omit<User, 'password' | 'library'>;
}

export interface UpdateProfile {
  body: Partial<Omit<User, 'password' | 'library'>>;
  response: Omit<User, 'password'>;
}

export interface UpdatePassword {
  body: {
    oldPassword: string;
    newPassword: string;
  };
}

export interface AddNovelToLibrary {
  body: {
    nid: string;
  };
  response: User['library'];
}
