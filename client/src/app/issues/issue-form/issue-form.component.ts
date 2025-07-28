import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { Issue } from '../../models/issue';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  template: `
    <div class="container mt-5">
      <div class="columns is-centered">
        <div class="column is-8">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title is-size-4">
                {{ isEdit ? 'Edit' : 'Create' }} Issue
              </p>
            </div>
            <div class="card-content">
              <form [formGroup]="form" (ngSubmit)="submit()">
                <div class="field">
                  <label class="label">Title</label>
                  <div class="control">
                    <input 
                      class="input" 
                      [class.is-danger]="form.get('title')?.invalid && form.get('title')?.touched"
                      type="text" 
                      formControlName="title" 
                      placeholder="Enter issue title"
                    />
                  </div>
                  <p class="help is-danger" *ngIf="form.get('title')?.invalid && form.get('title')?.touched">
                    Title is required
                  </p>
                </div>

                <div class="field">
                  <label class="label">Description</label>
                  <div class="control">
                    <textarea 
                      class="textarea" 
                      [class.is-danger]="form.get('description')?.invalid && form.get('description')?.touched"
                      formControlName="description" 
                      placeholder="Enter issue description"
                      rows="4"
                    ></textarea>
                  </div>
                  <p class="help is-danger" *ngIf="form.get('description')?.invalid && form.get('description')?.touched">
                    Description is required
                  </p>
                </div>

                <div class="field">
                  <label class="label">Project</label>
                  <div class="control">
                    <input 
                      class="input" 
                      [class.is-danger]="form.get('project')?.invalid && form.get('project')?.touched"
                      type="text" 
                      formControlName="project" 
                      placeholder="Enter project name"
                    />
                  </div>
                  <p class="help is-danger" *ngIf="form.get('project')?.invalid && form.get('project')?.touched">
                    Project is required
                  </p>
                </div>

                <div class="field">
                  <label class="label">Assignee</label>
                  <div class="control">
                    <input 
                      class="input" 
                      type="text" 
                      formControlName="assignee" 
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>

                <div class="columns">
                  <div class="column">
                    <div class="field">
                      <label class="label">Priority</label>
                      <div class="control">
                        <div class="select is-fullwidth">
                          <select formControlName="priority">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="column">
                    <div class="field">
                      <label class="label">Status</label>
                      <div class="control">
                        <div class="select is-fullwidth">
                          <select formControlName="status">
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field is-grouped">
                  <div class="control">
                    <button 
                      class="button is-primary" 
                      type="submit" 
                      [disabled]="form.invalid"
                      [class.is-loading]="isSubmitting"
                    >
                      {{ isEdit ? 'Update' : 'Create' }} Issue
                    </button>
                  </div>
                  <div class="control">
                    <button 
                      class="button is-light" 
                      type="button" 
                      (click)="router.navigate(['/'])"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule, ReactiveFormsModule],
})
export class IssueFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  isSubmitting = false;
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
      title: ['', Validators.required],
      description: ['', Validators.required],
      project: ['', Validators.required],
      assignee: [''],
      priority: ['Medium'],
      status: ['Open'],
    });

    if (this.isEdit) {
      this.service.getIssue(this.id!).subscribe(issue => this.form.patchValue(issue));
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const issue = this.form.value;
    
    if (this.isEdit) {
      this.service.updateIssue(this.id!, issue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating issue:', error);
        }
      });
    } else {
      this.service.createIssue(issue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating issue:', error);
        }
      });
    }
  }
}
