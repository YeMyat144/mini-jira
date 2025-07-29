import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Issue } from '../models/issue';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IssueService {
  private baseUrl = 'http://localhost:5074/api/issues';

  constructor(private http: HttpClient) {}

  getIssues(projectId?: number, assigneeId?: number, issueTypeId?: number, issueStatusId?: number): Observable<Issue[]> {
    let params = new HttpParams();
    
    if (projectId) {
      params = params.set('projectId', projectId.toString());
    }
    
    if (assigneeId) {
      params = params.set('assigneeId', assigneeId.toString());
    }
    
    if (issueTypeId) {
      params = params.set('issueTypeId', issueTypeId.toString());
    }
    
    if (issueStatusId) {
      params = params.set('issueStatusId', issueStatusId.toString());
    }
    
    return this.http.get<Issue[]>(this.baseUrl, { params });
  }

  getIssue(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${this.baseUrl}/${id}`);
  }

  createIssue(issue: Issue): Observable<Issue> {
    return this.http.post<Issue>(this.baseUrl, issue);
  }

  updateIssue(id: number, issue: Issue): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, issue);
  }
  
  updateIssueStatus(issueId: number, statusId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${issueId}/status/${statusId}`, {});
  }

  deleteIssue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  
  getKanbanBoard(projectId?: number): Observable<any> {
    let params = new HttpParams();
    
    if (projectId) {
      params = params.set('projectId', projectId.toString());
    }
    
    return this.http.get<any>(`${this.baseUrl}/kanban`, { params });
  }
}
