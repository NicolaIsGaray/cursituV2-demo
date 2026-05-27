import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Topic } from '../models/topic.model';
import { environment } from '../../environments/environment';
import { Assignment } from '../models/assignment.model';

interface TopicData {
  timeAgo: string;
}

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}/topics`;

  private readonly TOPIC_KEY = 'cursitu_selected_topic';

  setTopicInStorage(value: any): void {
    const now = new Date().getTime();

    const item = {
      value: value,
      createdAt: now,
      expiry: now + 28800000,
    };

    localStorage.setItem(this.TOPIC_KEY, JSON.stringify(item));
  }

  getRelativeTime(createdAt: number): string {
    const now = new Date().getTime();
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    if (diffInSeconds < 60) {
      return 'Visto hace un momento';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  getTopicFromStorage(): string | null {
    const itemStr = localStorage.getItem(this.TOPIC_KEY);

    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(this.TOPIC_KEY);
      return null;
    }

    return item.value;
  }

  getTopicTimeFromStorage(): TopicData | null {
    const itemStr = localStorage.getItem(this.TOPIC_KEY);

    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    return {
      timeAgo: this.getRelativeTime(item.createdAt),
    };
  }

  getAllTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.apiUrl);
  }

  getTopicById(id: string): Observable<Topic> {
    return this.http.get<Topic>(`${this.apiUrl}/${id}`);
  }

  submitTopic(payload: {
    mode: string;
    topic: Topic;
    assignment: Assignment | null;
    classroom_id: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}`, payload);
  }

  modifyTopic(
    id: string,
    payload: {
      mode: string;
      topic: Topic;
      assignment: Assignment | null;
      classroom_id: string;
    },
  ) {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteTopic(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
