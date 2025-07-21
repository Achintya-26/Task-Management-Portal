import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domain } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private apiUrl = 'http://localhost:3000/api/domains';

  constructor(private http: HttpClient) {}

  getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(this.apiUrl);
  }

  createDomain(domainData: { name: string }): Observable<any> {
    return this.http.post(this.apiUrl, domainData);
  }

  updateDomain(domainId: string, domainData: { name: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${domainId}`, domainData);
  }

  deleteDomain(domainId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${domainId}`);
  }
}
