import { Routes } from '@angular/router';
import { IssueListComponent } from './issues/issue-list/issue-list.component';
import { IssueFormComponent } from './issues/issue-form/issue-form.component';
import { IssueDetailComponent } from './issues/issue-detail/issue-detail.component';
import { KanbanBoardComponent } from './issues/kanban-board/kanban-board.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { NotFoundComponent } from './not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'issues', pathMatch: 'full' },
  { path: 'issues', component: IssueListComponent },
  { path: 'issues/create', component: IssueFormComponent },
  { path: 'issues/:id', component: IssueDetailComponent },
  { path: 'issues/:id/edit', component: IssueFormComponent },
  { path: 'kanban', component: KanbanBoardComponent },
  { path: 'kanban/:projectId', component: KanbanBoardComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: '**', component: NotFoundComponent },
];
