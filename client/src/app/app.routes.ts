import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { IssueListComponent } from './issues/issue-list/issue-list.component';
import { IssueFormComponent } from './issues/issue-form/issue-form.component';
import { NotFoundComponent } from './not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: IssueListComponent },
      { path: 'create', component: IssueFormComponent },
      { path: 'edit/:id', component: IssueFormComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
