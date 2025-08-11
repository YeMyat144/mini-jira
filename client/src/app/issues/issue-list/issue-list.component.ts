import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { Issue } from '../../models/issue';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { IssueTypeService } from '../../services/issue-type.service';
import { IssueStatusService } from '../../services/issue-status.service';
import { Project } from '../../models/project';
import { User } from '../../models/user';
import { IssueType } from '../../models/issue-type';
import { IssueStatus } from '../../models/issue-status';
import { forkJoin } from 'rxjs';
import { RevealDirective } from '../../directives/reveal.directive';
import { NeonHoverDirective } from '../../directives/neon-hover.directive';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealDirective, NeonHoverDirective],
  templateUrl: './issue-list.component.html',
})
export class IssueListComponent implements OnInit {
  issues: Issue[] = [];
  projects: Project[] = [];
  users: User[] = [];
  issueTypes: IssueType[] = [];
  issueStatuses: IssueStatus[] = [];
  
  showDeleteModal = false;
  issueToDelete: Issue | null = null;
  isDeleting = false;
  isLoading = true;
  errorMessage = '';

  filters = {
    projectId: null as number | null,
    assigneeId: null as number | null,
    issueTypeId: null as number | null,
    issueStatusId: null as number | null
  };

  constructor(
    private issueService: IssueService,
    private projectService: ProjectService,
    private userService: UserService,
    private issueTypeService: IssueTypeService,
    private issueStatusService: IssueStatusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilterData();
  }

  loadFilterData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load all required data for filters
    forkJoin({
      projects: this.projectService.getProjects(),
      users: this.userService.getUsers(),
      issueTypes: this.issueTypeService.getIssueTypes(),
      issueStatuses: this.issueStatusService.getIssueStatuses()
    }).subscribe({
      next: (result) => {
        this.projects = result.projects;
        this.users = result.users;
        this.issueTypes = result.issueTypes;
        this.issueStatuses = result.issueStatuses;
        this.loadIssues();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load filter data. Please try again.';
        console.error('Error loading filter data:', error);
        this.isLoading = false;
      }
    });
  }

  loadIssues(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.issueService.getIssues(
      this.filters.projectId === null ? undefined : this.filters.projectId,
      this.filters.assigneeId === -1 ? undefined : (this.filters.assigneeId === null ? undefined : this.filters.assigneeId),
      this.filters.issueTypeId === null ? undefined : this.filters.issueTypeId,
      this.filters.issueStatusId === null ? undefined : this.filters.issueStatusId
    ).subscribe({
      next: (data) => {
        this.issues = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load issues. Please try again.';
        console.error('Error loading issues:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadIssues();
  }

  resetFilters(): void {
    this.filters = {
      projectId: null,
      assigneeId: null,
      issueTypeId: null,
      issueStatusId: null
    };
    this.loadIssues();
  }

  confirmDelete(issue: Issue): void {
    this.issueToDelete = issue;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.issueToDelete = null;
    this.isDeleting = false;
  }

  delete(): void {
    if (this.issueToDelete?.id) {
      this.isDeleting = true;
      this.issueService.deleteIssue(this.issueToDelete.id).subscribe({
        next: () => {
          this.loadIssues();
          this.cancelDelete();
        },
        error: (error) => {
          this.isDeleting = false;
          console.error('Error deleting issue:', error);
        }
      });
    }
  }

  getIssueTypeIcon(issueType: IssueType): string {
    if (!issueType || !issueType.icon) return 'fas fa-tasks';
    return issueType.icon;
  }

  getPriorityClass(priority: string): string {
    if (!priority) return 'is-light';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'is-danger';
      case 'medium': return 'is-warning';
      case 'low': return 'is-success';
      default: return 'is-light';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'is-light';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('to do') || statusLower.includes('open') || statusLower.includes('new')) {
      return 'is-info';
    } else if (statusLower.includes('in progress') || statusLower.includes('doing')) {
      return 'is-warning';
    } else if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('complete')) {
      return 'is-success';
    } else {
      return 'is-light';
    }
  }
}
