import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { Issue } from '../../models/issue';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  template: `
    <h2>{{ isEdit ? 'Edit' : 'Create' }} Issue</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Title: <input formControlName="title" /></label><br />
      <label>Description: <textarea formControlName="description"></textarea></label><br />
      <label>Priority:
        <select formControlName="priority">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </label><br />
      <label>Status:
        <select formControlName="status">
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
        </select>
      </label><br />
      <button type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
      <button type="button" (click)="router.navigate(['/'])">Cancel</button>
    </form>
  `,
  imports: [CommonModule, ReactiveFormsModule],
})
export class IssueFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id?: number;

  constructor(
    private fb: FormBuilder,
    private service: IssueService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.id;

    this.form = this.fb.group({
      title: '',
      description: '',
      priority: 'Low',
      status: 'Open',
    });

    if (this.isEdit) {
      this.service.getIssue(this.id!).subscribe(issue => this.form.patchValue(issue));
    }
  }

  submit(): void {
    const issue = this.form.value;
    if (this.isEdit) {
      this.service.updateIssue(this.id!, issue).subscribe(() => this.router.navigate(['/']));
    } else {
      this.service.createIssue(issue).subscribe(() => this.router.navigate(['/']));
    }
  }
}
