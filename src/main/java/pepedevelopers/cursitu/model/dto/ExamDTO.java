package pepedevelopers.cursitu.model.dto;

import java.util.List;

public record ExamDTO(
  String date,
  String startTime,
  String endTime,
  String type,
  Integer totalStudents,
  List<TeacherSubmissionDTO> studentList,
  String assistment,
  Float note
) {}
