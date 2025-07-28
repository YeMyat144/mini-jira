export interface Issue {
  id?: number;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  project: string;
  assignee: string;
}