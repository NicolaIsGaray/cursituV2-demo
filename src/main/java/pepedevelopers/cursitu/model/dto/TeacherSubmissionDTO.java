package pepedevelopers.cursitu.model.dto;

public record TeacherSubmissionDTO(
  String studentId,
  String studentName,
  String submissionId,
  String fileUrl,
  String submissionDate,
  Boolean isLate,
  float grade,
  String status,
  String activityName
) {}
