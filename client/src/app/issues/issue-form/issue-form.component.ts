import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { IssueTypeService } from '../../services/issue-type.service';
import { IssueStatusService } from '../../services/issue-status.service';
import { Issue } from '../../models/issue';
import { Project } from '../../models/project';
import { User } from '../../models/user';
import { IssueType } from '../../models/issue-type';
import { IssueStatus } from '../../models/issue-status';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  styleUrls: ['./issue-form.component.css'],
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
              <div *ngIf="isLoading" class="has-text-centered">
                <p class="is-size-5">Loading...</p>
              </div>
              <div *ngIf="errorMessage" class="notification is-danger">
                {{ errorMessage }}
              </div>
              <form *ngIf="!isLoading" [formGroup]="form" (ngSubmit)="submit()">
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
                    <div class="select is-fullwidth" [class.is-danger]="form.get('projectId')?.invalid && form.get('projectId')?.touched">
                      <select formControlName="projectId">
                        <option [value]="null" disabled>Select a project</option>
                        <option *ngFor="let project of projects" [value]="project.id">{{ project.name }} ({{ project.key }})</option>
                      </select>
                    </div>
                  </div>
                  <p class="help is-danger" *ngIf="form.get('projectId')?.invalid && form.get('projectId')?.touched">
                    Project is required
                  </p>
                </div>

                <div class="field">
                  <label class="label">Issue Type</label>
                  <div class="control">
                    <div class="select is-fullwidth" [class.is-danger]="form.get('issueTypeId')?.invalid && form.get('issueTypeId')?.touched">
                      <select formControlName="issueTypeId">
                        <option [value]="null" disabled>Select an issue type</option>
                        <option *ngFor="let type of issueTypes" [value]="type.id">{{ type.name }}</option>
                      </select>
                    </div>
                  </div>
                  <p class="help is-danger" *ngIf="form.get('issueTypeId')?.invalid && form.get('issueTypeId')?.touched">
                    Issue type is required
                  </p>
                </div>

                <div class="field">
                  <label class="label">Status</label>
                  <div class="control">
                    <div class="select is-fullwidth" [class.is-danger]="form.get('issueStatusId')?.invalid && form.get('issueStatusId')?.touched">
                      <select formControlName="issueStatusId">
                        <option [value]="null" disabled>Select a status</option>
                        <option *ngFor="let status of issueStatuses" [value]="status.id">{{ status.name }}</option>
                      </select>
                    </div>
                  </div>
                  <p class="help is-danger" *ngIf="form.get('issueStatusId')?.invalid && form.get('issueStatusId')?.touched">
                    Status is required
                  </p>
                </div>

                <div class="field">
                  <label class="label">Assignee</label>
                  <div class="control">
                    <div class="select is-fullwidth">
                      <select formControlName="assigneeId">
                        <option [value]="null">Unassigned</option>
                        <option *ngFor="let user of users" [value]="user.id">{{ user.displayName || user.username }}</option>
                      </select>
                    </div>
                  </div>
                </div>

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
  isLoading = true;
  errorMessage = '';
  id?: number;
  
  projects: Project[] = [];
  users: User[] = [];
  issueTypes: IssueType[] = [];
  issueStatuses: IssueStatus[] = [];

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private projectService: ProjectService,
    private userService: UserService,
    private issueTypeService: IssueTypeService,
    private issueStatusService: IssueStatusService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.id;

    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      projectId: [null, Validators.required],
      assigneeId: [null],
      issueTypeId: [null, Validators.required],
      issueStatusId: [null, Validators.required],
      priority: ['Medium'],
    });

    this.loadFormData();
  }

  loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load all required data in parallel
    const projects$ = this.projectService.getProjects();
    const users$ = this.userService.getUsers();
    const issueTypes$ = this.issueTypeService.getIssueTypes();
    const issueStatuses$ = this.issueStatusService.getIssueStatuses();
    
    // Combine all observables
    forkJoin({
      projects: projects$,
      users: users$,
      issueTypes: issueTypes$,
      issueStatuses: issueStatuses$,
      issue: this.isEdit ? this.issueService.getIssue(this.id!) : of(null)
    }).subscribe({
      next: (result) => {
        this.projects = result.projects;
        this.users = result.users;
        this.issueTypes = result.issueTypes;
        this.issueStatuses = result.issueStatuses;
        
        if (this.isEdit && result.issue) {
          this.form.patchValue({
            title: result.issue.title,
            description: result.issue.description,
            projectId: result.issue.projectId,
            assigneeId: result.issue.assigneeId,
            issueTypeId: result.issue.issueTypeId,
            issueStatusId: result.issue.issueStatusId,
            priority: result.issue.priority
          });
        } else if (!this.isEdit && this.issueStatuses.length > 0) {
          // Set default status to the first one (usually 'Open' or 'To Do')
          this.form.patchValue({
            issueStatusId: this.issueStatuses[0].id
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load form data. Please try again.';
        console.error('Error loading form data:', error);
        this.isLoading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const issue = this.form.value;
    
    if (this.isEdit) {
      this.issueService.updateIssue(this.id!, issue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/issues', this.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update issue. Please try again.';
          console.error('Error updating issue:', error);
        }
      });
    } else {
      this.issueService.createIssue(issue).subscribe({
        next: (createdIssue) => {
          this.isSubmitting = false;
          this.router.navigate(['/issues', createdIssue.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create issue. Please try again.';
          console.error('Error creating issue:', error);
        }
      });
    }
  }
}
