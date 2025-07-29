import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueStatus } from '../models/issue-status';

@Injectable({
  providedIn: 'root'
})
export class IssueStatusService {
  private apiUrl = 'http://localhost:5074/api/issuestatuses';

  constructor(private http: HttpClient) { }

  getIssueStatuses(): Observable<IssueStatus[]> {
    return this.http.get<IssueStatus[]>(this.apiUrl);
  }

  getIssueStatus(id: number): Observable<IssueStatus> {
    return this.http.get<IssueStatus>(`${this.apiUrl}/${id}`);
  }

  createIssueStatus(issueStatus: IssueStatus): Observable<IssueStatus> {
    return this.http.post<IssueStatus>(this.apiUrl, issueStatus);
  }

  updateIssueStatus(issueStatus: IssueStatus): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${issueStatus.id}`, issueStatus);
  }

  deleteIssueStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorderIssueStatuses(statuses: IssueStatus[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, statuses);
  }
}