import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Issue } from '../../models/issue';
import { IssueService } from '../../services/issue.service';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Issue List</h2>
    <button (click)="navigateToCreate()">Create New</button>
    <ul>
      <li *ngFor="let issue of issues">
        <b>{{ issue.title }}</b> - {{ issue.status }} - {{ issue.priority }}
        <button (click)="edit(issue.id)">Edit</button>
        <button (click)="delete(issue.id)">Delete</button>
      </li>
    </ul>
  `,
})
export class IssueListComponent implements OnInit {
  issues: Issue[] = [];

  constructor(private service: IssueService, private router: Router) {}

  ngOnInit(): void {
    this.service.getIssues().subscribe(data => this.issues = data);
  }

  navigateToCreate() {
    this.router.navigate(['/create']);
  }

  edit(id?: number) {
    this.router.navigate(['/edit', id]);
  }

  delete(id?: number) {
    if (id) {
      this.service.deleteIssue(id).subscribe(() => this.ngOnInit());
    }
  }
}
