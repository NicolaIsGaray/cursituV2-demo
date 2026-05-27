package pepedevelopers.cursitu.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.SubjectEntity;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.model.dto.*;
import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;
import pepedevelopers.cursitu.model.subject_submodel.GradesEntity;
import pepedevelopers.cursitu.model.subject_submodel.SubmissionEntity;
import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;
import pepedevelopers.cursitu.repository.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentService {
  private final IAssignment assignmentRepo;
  private final ISubmission submissionRepo;
  private final ISubject subjectRepo;
  private final IClassroom classroomRepo;
  private final IGrades gradesRepo;
  private final IUser userRepo;
  private final ITopics topicRepo;

  public AssignmentService(IAssignment assignmentRepo, ISubmission submissionRepo, ISubject subjectRepo, IClassroom classroomRepo, IGrades gradesRepo, IUser userRepo, ITopics topicRepo) {
    this.assignmentRepo = assignmentRepo;
    this.submissionRepo = submissionRepo;
    this.subjectRepo = subjectRepo;
    this.classroomRepo = classroomRepo;
    this.gradesRepo = gradesRepo;
    this.userRepo = userRepo;
    this.topicRepo = topicRepo;
  }

  @Transactional
  public AssignmentEntity updateAssignment(String id, AssignmentEntity update) {
    AssignmentEntity assignment = assignmentRepo.findById(id).orElse(null);

    if (assignment == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea o Parcial no encontrado.");
    }

    assignment.setTitle(update.getTitle() == null ? assignment.getTitle() : update.getTitle());
    assignment.setContent(update.getContent() == null ? assignment.getContent() : update.getContent());
    assignment.setDate_limit(update.getDate_limit() == null ? assignment.getDate_limit() : update.getDate_limit());
    assignment.setEnabled_to_deliver(update.getEnabled_to_deliver() == null ? assignment.getEnabled_to_deliver() : update.getEnabled_to_deliver());
    assignment.setType(update.getType() == null ? assignment.getType() : update.getType());
    assignment.setSentBy(update.getSentBy() == null ? assignment.getSentBy() : update.getSentBy());

    return assignmentRepo.save(assignment);
  }

  @Transactional
  public void deleteAssignment(String id) {
    AssignmentEntity assignmentToErase = assignmentRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Actividad no encontrada."));

    submissionRepo.findByActivityId(assignmentToErase.getId()).ifPresent(submissionRepo::delete);

    TopicEntity topicAssigned = topicRepo.findByAssignmentId(assignmentToErase.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada."));

    topicAssigned.setAssignmentId(null);
    topicRepo.save(topicAssigned);

    assignmentRepo.delete(assignmentToErase);
  }

  public AssignmentEntity getAssignmentInTopic(String assingmentId) {
    AssignmentEntity assignment = assignmentRepo.findById(assingmentId).orElse(null);

    if (assignment == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay ninguna actividad en la clase.");
    }

    return assignment;
  }

  @Transactional
  public List<AssignmentEntity> getAllAssignmentsInSubject(String subjectId) {
    SubjectEntity subject = subjectRepo.findById(subjectId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materia no encontrada.")
    );

    List<AssignmentEntity> allAssignments = assignmentRepo.findAll();

    List<AssignmentEntity> assignmentToSend = new ArrayList<>();

    allAssignments.forEach(assignment -> {
      if (Objects.equals(subject.getId(), assignment.getSubject_id())) {
        assignmentToSend.add(assignment);
      }
    });

    return assignmentToSend;
  }

  public List<AssignmentDTO> getPendingAssignmentsForStudent(String studentId) {
    List<AssignmentEntity> allAssignments = assignmentRepo.findAll();
    return allAssignments.stream()
      .map(activity -> {
        Optional<SubmissionEntity> submission = submissionRepo
          .findByActivityIdAndStudentId(activity.getId(), studentId);

        String status = submission.isPresent() ? submission.get().getStatus() : "NO_ENTREGADO";

        return new AssignmentDTO(
          activity.getId(),
          activity.getTitle(),
          activity.getDate_limit(),
          status
        );
      })
      .filter(dto -> "NO_ENTREGADO".equals(dto.status()))
      .collect(Collectors.toList());
  }

  public String checkSubmissionStatus(String studentId, String activityId) {
    AssignmentEntity assignment = assignmentRepo.findById(activityId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Actividad no encontrada.")
    );

    Optional<SubmissionEntity> optionalSubmission = submissionRepo.findByActivityIdAndStudentId(activityId, studentId);

    if (optionalSubmission.isEmpty()) {
      return "NO_ENTREGADO";
    }

    SubmissionEntity submission = optionalSubmission.get();

    return submission.getStatus();
  }

  @Transactional
  public SubmissionEntity submitActivity(String activityId, String studentId, SubmissionEntity submission) {
    AssignmentEntity assignment = assignmentRepo.findById(activityId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Actividad no encontrada.")
    );

    SubmissionEntity newSubmission = new SubmissionEntity();
    newSubmission.setActivityId(assignment.getId());
    newSubmission.setStudentId(studentId);
    newSubmission.setFile_url(submission.getFile_url());
    newSubmission.setComment(submission.getComment());
    newSubmission.setSubmission_date(submission.getSubmission_date());
    newSubmission.setStatus("ENTREGADO");

    SubmissionEntity savedSubmission = submissionRepo.save(newSubmission);

    List<String> sentByList = assignment.getSentBy();

    if (sentByList == null) {
      sentByList = new ArrayList<>();
    } else {
      sentByList = new ArrayList<>(sentByList);
    }

    if (!sentByList.contains(studentId)) {
      sentByList.add(studentId);
      assignment.setSentBy(sentByList);

      assignmentRepo.save(assignment);
    }

    return savedSubmission;
  }

  @Transactional(readOnly = true)
  public List<TeacherSubmissionDTO> getAssignmentsTableForTeacher(String classroomId, String activityId) {
    ClassroomEntity classroom = classroomRepo.findById(classroomId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));

    AssignmentEntity activity = assignmentRepo.findById(activityId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Actividad no encontrada."));

    List<String> studentIds = classroom.getStudents_id();
    if (studentIds == null || studentIds.isEmpty()) {
      return new ArrayList<>();
    }

    List<UserEntity> students = userRepo.findAllById(studentIds);

    List<SubmissionEntity> submissions = submissionRepo.findByActivityIdAndStudentIdIn(activityId, studentIds);
    List<GradesEntity> grades = gradesRepo.findByActivityIdAndStudentIdIn(activityId, studentIds);

    return students.stream().map(student -> {
      SubmissionEntity submission = submissions.stream()
        .filter(s -> s.getStudentId().equals(student.getId()))
        .findFirst()
        .orElse(null);

      GradesEntity grade = grades.stream()
        .filter(g -> g.getStudentId().equals(student.getId()))
        .findFirst()
        .orElse(null);

      boolean isLate = false;
      if (submission != null && submission.getSubmission_date() != null && activity.getDate_limit() != null) {
        isLate = submission.getSubmission_date().isAfter(activity.getDate_limit());
      }

      String submissionId = (submission != null) ? submission.getId() : null;
      String fileUrl = (submission != null) ? submission.getFile_url() : null;
      String subDate = (submission != null) ? submission.getSubmission_date().toString() : null;
      Float qualification = (grade != null) ? grade.getQualification() : 0.0f;

      String status = "SIN_ENTREGAR";
      if (submission != null) {
        status = (grade != null) ? "CORREGIDO" : "PENDIENTE";
      }

      return new TeacherSubmissionDTO(
        student.getId(),
        student.getName(),
        submissionId,
        fileUrl,
        subDate,
        isLate,
        qualification,
        status,
        activity.getTitle()
      );
    }).toList();
  }

  @Transactional(readOnly = true)
  public ExamDTO getExamSubmissionDetails(String classroomId, String activityId, String examType) {
    ClassroomEntity classroom = classroomRepo.findById(classroomId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));

    AssignmentEntity activity = assignmentRepo.findById(activityId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parcial no encontrado."));

    List<String> studentIds = classroom.getStudents_id();
    if (studentIds == null || studentIds.isEmpty()) {
      return new ExamDTO(
        activity.getDate_limit() != null ? activity.getDate_limit().toLocalDate().toString() : null,
        null, null, examType, 0, new ArrayList<>(), "Sin alumnos inscritos.", 0.0f
      );
    }

    List<UserEntity> students = userRepo.findAllById(studentIds);
    List<GradesEntity> grades = gradesRepo.findByActivityIdAndStudentIdIn(activityId, studentIds);

    List<SubmissionEntity> submissions = "VIRTUAL".equalsIgnoreCase(examType)
      ? submissionRepo.findByActivityIdAndStudentIdIn(activityId, studentIds)
      : new ArrayList<>();

    List<TeacherSubmissionDTO> processedStudentList = students.stream().map(student -> {
      SubmissionEntity submission = submissions.stream()
        .filter(s -> s.getStudentId().equals(student.getId()))
        .findFirst()
        .orElse(null);

      GradesEntity grade = grades.stream()
        .filter(g -> g.getStudentId().equals(student.getId()))
        .findFirst()
        .orElse(null);

      boolean isLate = false;
      if (submission != null && submission.getSubmission_date() != null && activity.getDate_limit() != null) {
        isLate = submission.getSubmission_date().isAfter(activity.getDate_limit());
      }

      String submissionId = (submission != null) ? submission.getId() : null;
      String fileUrl = (submission != null) ? submission.getFile_url() : null;
      String subDate = (submission != null) ? submission.getSubmission_date().toString() : null;
      Float qualification = (grade != null) ? grade.getQualification() : 0.0f;

      String status = "SIN_ENTREGAR";
      if ("PRESENCIAL".equalsIgnoreCase(examType)) {
        status = (grade != null) ? "CORREGIDO" : "PENDIENTE";
      } else if (submission != null) {
        status = (grade != null) ? "CORREGIDO" : "PENDIENTE";
      }

      return new TeacherSubmissionDTO(
        student.getId(),
        student.getName(),
        submissionId,
        fileUrl,
        subDate,
        isLate,
        qualification,
        status,
        activity.getTitle()
      );
    }).toList();

    String examDate = null;
    String startTime = null;
    if (activity.getCreatedAt() != null) {
      examDate = activity.getCreatedAt().toLocalDate().toString();
      startTime = activity.getCreatedAt().toLocalTime().toString();
    } else if (activity.getDate_limit() != null) {
      examDate = activity.getDate_limit().toLocalDate().toString();
    }
    String endTime = activity.getDate_limit() != null ? activity.getDate_limit().toLocalTime().toString() : null;

    float totalNotes = 0.0f;
    int gradedCount = 0;
    for (GradesEntity g : grades) {
      if (g.getQualification() != null) {
        totalNotes += g.getQualification();
        gradedCount++;
      }
    }
    float averageNote = (gradedCount > 0) ? (totalNotes / gradedCount) : 0.0f;

    return new ExamDTO(
      examDate,
      startTime,
      endTime,
      examType.toUpperCase(),
      processedStudentList.size(),
      processedStudentList,
      "Planilla de examen generada de forma correcta.",
      averageNote
    );
  }

  @Transactional
  public void saveOrUpdateGrade(String studentId, String activityId, Float note) {
    Optional<GradesEntity> existingGrade = gradesRepo.findByActivityIdAndStudentId(activityId, studentId);

    if (existingGrade.isPresent()) {
      GradesEntity grade = existingGrade.get();
      grade.setQualification(note);
      gradesRepo.save(grade);
    } else {
      GradesEntity newGrade = new GradesEntity();
      newGrade.setActivityId(activityId);
      newGrade.setStudentId(studentId);
      newGrade.setQualification(note);
      gradesRepo.save(newGrade);
    }

    submissionRepo.findByActivityIdAndStudentId(activityId, studentId).ifPresent(submission -> {
      submission.setStatus("CORREGIDO");
      submissionRepo.save(submission);
    });
  }

  @Transactional(readOnly = true)
  public TaskStatsDTO getTaskStatistics(String classroomId, String taskId) {
    ClassroomEntity classroom = classroomRepo.findById(classroomId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

    List<String> enrolledStudents = classroom.getStudents_id();
    if (enrolledStudents == null) {
      enrolledStudents = new ArrayList<>();
    }
    int totalStudents = enrolledStudents.size();

    long provided = submissionRepo.countDistinctSentByActivityId(taskId);

    long not_provided = totalStudents - provided;

    long corrected = 0;
    if (!enrolledStudents.isEmpty()) {
      corrected = gradesRepo.countByActivityIdAndStudentIdIn(taskId, enrolledStudents);
    }

    return new TaskStatsDTO(totalStudents, provided, not_provided, corrected);
  }

  @Transactional
  public List<SubmissionEntity> getAllSubmited() {
    return submissionRepo.findAll();
  }

  @Transactional
  public void deleteSubmited(String id) {
    submissionRepo.deleteById(id);
  }

  @Transactional
  public List<GradesEntity> getGrades() {
    return gradesRepo.findAll();
  }

  @Transactional
  public void deleteGrade(String id) {
    gradesRepo.deleteById(id);
  }
}
