import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { Assignment } from '../models/assignment.model';
import { Submission } from '../models/submission.model';
import { AssignmentDTO } from '../models/dto/assignmentDTO';
import { Topic } from '../models/topic.model';
import { TaskStatsDTO } from '../models/dto/task-statsDTO';
import { TeacherSubmissionDTO } from '../models/dto/teacher-submissionDTO';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api}/assignment`;

  getAllAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(this.apiUrl);
  }

  getAssignmentById(id: string): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/${id}`).pipe(
      map((assignment) => ({
        ...assignment,
        date_limit: new Date(assignment.date_limit),
      })),
    );
  }

  createAssignment(assignment: Assignment): Observable<Object> {
    return this.http.post(this.apiUrl, assignment);
  }

  modifyAssignment(id: string, assignment: Assignment) {
    return this.http.put(`${this.apiUrl}/${id}`, assignment);
  }

  deleteAssignment(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAssignmentInTopic(topic: Topic): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/in-topic/${topic.assignmentId}`);
  }

  getAssignmentsInSubject(subjectId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/in-subject/${subjectId}`);
  }

  getPendingAssignments(studentId: string): Observable<AssignmentDTO[]> {
    return this.http.get<AssignmentDTO[]>(`${this.apiUrl}/student/${studentId}/pending`);
  }

  getTaskStats(classroomId: string, taskId: string): Observable<TaskStatsDTO> {
    return this.http.get<TaskStatsDTO>(`${this.apiUrl}/${classroomId}/tasks/${taskId}/stats`);
  }

  getStudentSubmissions(classroomId: string, activityId: string): Observable<TeacherSubmissionDTO[]> {
    return this.http.get<TeacherSubmissionDTO[]>(`${this.apiUrl}/professor-table/classroom/${classroomId}/assignment/${activityId}`);
  }

  checkSubmissionStatus(studentId: string, activityId: string): Observable<{ status: string }> {
    let params = new HttpParams();

    params = params.append('studentId', studentId);
    params = params.append('activityId', activityId);

    return this.http.get<{ status: string }>(`${this.apiUrl}/check-status`, { params });
  }

  submitActivity(
    activityId: string,
    studentId: string,
    submission: Submission,
  ): Observable<Object> {
    let params = new HttpParams();

    params = params.append('activityId', activityId);
    params = params.append('studentId', studentId);

    return this.http.post(`${this.apiUrl}/submit-activity`, submission, { params });
  }

  saveOrUpdateGrade(studentId: string, activityId: string, note: number) {
    return this.http.post(`${this.apiUrl}/professor-correction/student/${studentId}/assignment/${activityId}`, note);
  }

  deleteGrade(studentIdInGrade: string) {
    return this.http.delete(`${this.apiUrl}/grades/${studentIdInGrade}`);
  }
}
