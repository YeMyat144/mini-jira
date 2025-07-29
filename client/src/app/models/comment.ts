import { User } from './user';

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  issueId: number;
  userId: number;
  user?: User;
}