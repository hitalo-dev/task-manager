import { User } from '@prisma/client';
import { Request } from 'express';

export interface OmitUser extends Omit<User, 'password'> {}

export interface GoogleUser {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface RequestWithGoogleUser extends Request {
  user: GoogleUser;
}
