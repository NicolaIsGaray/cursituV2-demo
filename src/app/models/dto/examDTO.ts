import { TeacherSubmissionDTO } from "./teacher-submissionDTO";

export interface ExamDTO {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  type: 'VIRTUAL' | 'PRESENCIAL';
  totalStudents: number;
  studentList: TeacherSubmissionDTO[];
  assistment: string;
  note: number;
}