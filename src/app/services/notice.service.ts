import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notice } from '../models/notice.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NoticeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}/notices`

  getAllNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(this.apiUrl);
  }

  getNoticeById(id: string): Observable<Notice> {
    return this.http.get<Notice>(`${this.apiUrl}/${id}`);
  }

  createNotice(notice: Notice): Observable<Object> {
    return this.http.post(this.apiUrl, notice);
  }

  modifyNotice(id: string, notice: Notice) {
    return this.http.put(`${this.apiUrl}/${id}`, notice);
  }

  deleteNotice(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSenderNotices(senderId: string): Observable<Notice[]> {
    return this.http.get<Notice[]>(`${this.apiUrl}/sender/${senderId}`);
  }
}
