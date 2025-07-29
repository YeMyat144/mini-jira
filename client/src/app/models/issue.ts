import { Project } from './project';
import { User } from './user';
import { IssueType } from './issue-type';
import { IssueStatus } from './issue-status';
import { Comment } from './comment';

export interface Issue {
  id?: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  
  // Foreign keys
  projectId: number;
  assigneeId?: number;
  issueTypeId: number;
  issueStatusId: number;
  
  // Navigation properties
  project?: Project;
  assignee?: User;
  issueType?: IssueType;
  issueStatus?: IssueStatus;
  comments?: Comment[];
}