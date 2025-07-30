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
  templateUrl: './issue-form.component.html',
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
