import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IssueService } from '../../services/issue.service';
import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';
import { Issue } from '../../models/issue';
import { Comment } from '../../models/comment';
import { User } from '../../models/user';

@Component({
  selector: 'app-issue-detail',
  template: `
    <div *ngIf="isLoading" class="loading-spinner">
      <p>Loading issue details...</p>
    </div>`,
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnInit {
  issue?: Issue;
  users: User[] = [];
  commentForm: FormGroup;
  isLoading = false;
  isCommentLoading = false;
  errorMessage = '';
  commentErrorMessage = '';
  currentUserId = 1; // Default user ID (in a real app, this would come from authentication)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private commentService: CommentService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadIssue();
    this.loadUsers();
  }

  loadIssue(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isLoading = true;
      this.issueService.getIssue(id).subscribe({
        next: (issue) => {
          this.issue = issue;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load issue details';
          console.error('Error loading issue', error);
          this.isLoading = false;
        }
      });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users', error);
      }
    });
  }

  getUserName(userId?: number): string {
    if (!userId) return 'Unassigned';
    const user = this.users.find(u => u.id === userId);
    return user ? user.displayName : 'Unknown User';
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
        return 'text-danger';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString();
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.issue) {
      return;
    }

    const newComment: Comment = {
      id: 0,
      content: this.commentForm.value.content,
      createdAt: new Date(),
      issueId: this.issue.id!,
      userId: this.currentUserId
    };

    this.isCommentLoading = true;
    this.commentService.createComment(newComment).subscribe({
      next: (comment) => {
        // Add the new comment to the issue's comments array
        if (!this.issue!.comments) {
          this.issue!.comments = [];
        }
        
        // Find the user for the comment
        const user = this.users.find(u => u.id === this.currentUserId);
        comment.user = user;
        
        this.issue!.comments.push(comment);
        this.commentForm.reset();
        this.isCommentLoading = false;
      },
      error: (error) => {
        this.commentErrorMessage = 'Failed to add comment';
        console.error('Error adding comment', error);
        this.isCommentLoading = false;
      }
    });
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          // Remove the comment from the issue's comments array
          if (this.issue && this.issue.comments) {
            this.issue.comments = this.issue.comments.filter(c => c.id !== commentId);
          }
        },
        error: (error) => {
          this.commentErrorMessage = 'Failed to delete comment';
          console.error('Error deleting comment', error);
        }
      });
    }
  }

  navigateToEdit(): void {
    this.router.navigate(['/issues/edit', this.issue?.id]);
  }
}