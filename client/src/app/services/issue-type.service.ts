import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueType } from '../models/issue-type';

@Injectable({
  providedIn: 'root'
})
export class IssueTypeService {
  private apiUrl = 'http://localhost:5074/api/issuetypes';

  constructor(private http: HttpClient) { }

  getIssueTypes(): Observable<IssueType[]> {
    return this.http.get<IssueType[]>(this.apiUrl);
  }

  getIssueType(id: number): Observable<IssueType> {
    return this.http.get<IssueType>(`${this.apiUrl}/${id}`);
  }

  createIssueType(issueType: IssueType): Observable<IssueType> {
    return this.http.post<IssueType>(this.apiUrl, issueType);
  }

  updateIssueType(issueType: IssueType): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${issueType.id}`, issueType);
  }

  deleteIssueType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}