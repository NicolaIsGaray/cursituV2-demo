export interface TeacherSubmissionDTO {
  studentId: string;
  studentName: string;
  submissionId?: string;
  fileUrl?: string;
  submissionDate?: string;
  isLate: boolean;
  grade?: number;
  gradeId?: string;
  status: 'PENDIENTE' | 'CORREGIDO' | 'SIN_ENTREGAR';
  activityName: string;
}