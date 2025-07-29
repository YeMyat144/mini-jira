import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { IssueService } from '../../services/issue.service';
import { ProjectService } from '../../services/project.service';
import { Issue } from '../../models/issue';
import { Project } from '../../models/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface KanbanColumn {
  id: number;
  name: string;
  order: number;
  issues: Issue[];
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule]
})
export class KanbanBoardComponent implements OnInit {
  columns: KanbanColumn[] = [];
  projects: Project[] = [];
  selectedProjectId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private issueService: IssueService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    
    // Check if a project ID is provided in the route
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.selectedProjectId = +params['projectId'];
        this.loadKanbanBoard();
      }
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        
        // If no project is selected and there are projects, select the first one
        if (!this.selectedProjectId && this.projects.length > 0) {
          this.selectedProjectId = this.projects[0].id;
          this.loadKanbanBoard();
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects';
        console.error('Error loading projects', error);
      }
    });
  }

  loadKanbanBoard(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.issueService.getKanbanBoard(this.selectedProjectId).subscribe({
      next: (data) => {
        this.columns = data.columns;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load Kanban board';
        console.error('Error loading Kanban board', error);
        this.isLoading = false;
      }
    });
  }

  onProjectChange(): void {
    this.loadKanbanBoard();
  }

  getConnectedLists(): string[] {
    return this.columns.map(column => `column-${column.id}`);
  }

  drop(event: CdkDragDrop<Issue[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving to a different column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the issue status in the backend
      const issueId = event.item.data.id;
      const newStatusId = +event.container.id.replace('column-', '');
      
      this.issueService.updateIssueStatus(issueId, newStatusId).subscribe({
        error: (error) => {
          this.errorMessage = 'Failed to update issue status';
          console.error('Error updating issue status', error);
          // Reload the board to revert changes if the update failed
          this.loadKanbanBoard();
        }
      });
    }
  }

  getIssueTypeIcon(issueType: any): string {
    if (!issueType) return 'bi bi-question-circle';
    
    switch (issueType.name.toLowerCase()) {
      case 'bug':
        return 'bi bi-bug';
      case 'task':
        return 'bi bi-check2-square';
      case 'epic':
        return 'bi bi-lightning';
      default:
        return 'bi bi-card-text';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }
}