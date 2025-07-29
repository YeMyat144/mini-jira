import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  projectForm: FormGroup;
  isEditing = false;
  currentProjectId?: number;
  showForm = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required]],
      key: ['', [Validators.required, Validators.pattern('[A-Z0-9]{2,10}')]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects. Please try again.';
        console.error('Error loading projects', error);
        this.isLoading = false;
      }
    });
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.currentProjectId = undefined;
    this.projectForm.reset();
    this.showForm = true;
  }

  openEditForm(project: Project): void {
    this.isEditing = true;
    this.currentProjectId = project.id;
    this.projectForm.patchValue({
      name: project.name,
      key: project.key,
      description: project.description || ''
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.projectForm.reset();
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    const projectData: Project = {
      id: this.isEditing ? this.currentProjectId! : 0,
      name: this.projectForm.value.name,
      key: this.projectForm.value.key,
      description: this.projectForm.value.description
    };

    this.isLoading = true;
    if (this.isEditing) {
      this.projectService.updateProject(projectData).subscribe({
        next: () => {
          this.loadProjects();
          this.showForm = false;
          this.projectForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to update project. Please try again.';
          console.error('Error updating project', error);
          this.isLoading = false;
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: () => {
          this.loadProjects();
          this.showForm = false;
          this.projectForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to create project. Please try again.';
          console.error('Error creating project', error);
          this.isLoading = false;
        }
      });
    }
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.isLoading = true;
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete project. It may have associated issues.';
          console.error('Error deleting project', error);
          this.isLoading = false;
        }
      });
    }
  }
}