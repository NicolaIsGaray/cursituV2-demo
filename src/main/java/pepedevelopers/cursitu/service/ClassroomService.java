package pepedevelopers.cursitu.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.SubjectEntity;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.model.dto.ClassroomDTO;
import pepedevelopers.cursitu.model.dto.ExamDTO;
import pepedevelopers.cursitu.model.dto.TeacherSubmissionDTO;
import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;
import pepedevelopers.cursitu.model.subject_submodel.GradesEntity;
import pepedevelopers.cursitu.model.subject_submodel.SubmissionEntity;
import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;
import pepedevelopers.cursitu.repository.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ClassroomService {
  private final IClassroom classroomRepo;
  private final ISubject subjectRepo;
  private final IUser userRepo;
  private final ITopics topicsRepo;
  private final IAssignment assignmentRepo;
  private final ISubmission submissionRepo;
  private final IGrades gradesRepo;

  public ClassroomService(IClassroom classroomRepo, ISubject subjectRepo, IUser userRepo, ITopics topicsRepo, IAssignment assignmentRepo, ISubmission submissionRepo, IGrades gradesRepo) {
    this.classroomRepo = classroomRepo;
    this.subjectRepo = subjectRepo;
    this.userRepo = userRepo;
    this.topicsRepo = topicsRepo;
    this.assignmentRepo = assignmentRepo;
    this.submissionRepo = submissionRepo;
    this.gradesRepo = gradesRepo;
  }

  @Transactional
  public void modifyClassroom(String id, ClassroomEntity classroom) {
    ClassroomEntity modified = classroomRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));

    modified.setSubject_id(classroom.getSubject_id() == null ? modified.getSubject_id() : classroom.getSubject_id());
    modified.setTopics_id(classroom.getTopics_id() == null ? modified.getTopics_id() : classroom.getTopics_id());
    modified.setStudents_id(classroom.getStudents_id() == null ? modified.getStudents_id() : classroom.getStudents_id());

    classroomRepo.save(modified);
  }

  @Transactional
  public List<UserEntity> obtainStudentsInClassroom(String id) {
    ClassroomEntity classroom = classroomRepo.findById(id).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado.")
    );

    List<UserEntity> students = new ArrayList<>();

    if (classroom.getStudents_id() != null) {
      for (String studentId : classroom.getStudents_id()) {
        userRepo.findById(studentId).ifPresent(students::add);
      }
    } else {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se han encontrado alumnos registrados en el curso.");
    }

    return students;
  }

  @Transactional(readOnly = true)
  public ClassroomDTO getClassroomDetailsForView(String classroomId) {
    ClassroomEntity classroom = classroomRepo.findById(classroomId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));

    String subjectName = "Materia no asignada";
    if (classroom.getSubject_id() != null) {
      subjectName = subjectRepo.findById(classroom.getSubject_id())
        .map(SubjectEntity::getSubject_name)
        .orElse("Materia no encontrada");
    }

    List<TopicEntity> topics = new ArrayList<>();
    if (classroom.getTopics_id() != null && !classroom.getTopics_id().isEmpty()) {
      topics = topicsRepo.findAllById(classroom.getTopics_id());
    }

    return new ClassroomDTO(
      classroom.getId(),
      subjectName,
      topics
    );
  }

  @Transactional
  public List<AssignmentEntity> getOnlyTasksInClassroom(String classroomId) {
    ClassroomEntity classroom = classroomRepo.findById(classroomId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado.")
    );

    List<AssignmentEntity> tasks = new ArrayList<>();

    List<String> topicIds = classroom.getTopics_id();
    if (topicIds != null && !topicIds.isEmpty()) {
      for (String id : topicIds) {
        topicsRepo.findById(id).ifPresent(topic -> {
          if (topic.getAssignmentId() != null) {
            assignmentRepo.findById(topic.getAssignmentId()).ifPresent(task -> {
              if (Objects.equals(task.getType(), "tarea")) {
                tasks.add(task);
              }
            });
          }
        });
      }
    }

    return tasks;
  }

  @Transactional
  public List<AssignmentEntity> getOnlyExamsInClassroom(String classroomId) {
    ClassroomEntity classroom = classroomRepo.findById(classroomId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado.")
    );

    List<AssignmentEntity> exams = new ArrayList<>();

    List<String> topicIds = classroom.getTopics_id();
    if (topicIds != null && !topicIds.isEmpty()) {
      for (String id : topicIds) {
        topicsRepo.findById(id).ifPresent(topic -> {
          if (topic.getAssignmentId() != null) {
            assignmentRepo.findById(topic.getAssignmentId()).ifPresent(exam -> {
              if (Objects.equals(exam.getType(), "parcial")) {
                exams.add(exam);
              }
            });
          }
        });
      }
    }

    return exams;
  }

  public ExamDTO getExamDetails(String classroomId, String examId, String examType) {
    AssignmentEntity exam = assignmentRepo.findById(examId)
      .orElseThrow(() -> new RuntimeException("No se encontró el examen con ID: " + examId));

    ClassroomEntity classroom = classroomRepo.findById(classroomId)
      .orElseThrow(() -> new RuntimeException("No se encontró el aula con ID: " + classroomId));

    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    String examDate = exam.getDate_limit() != null ? exam.getDate_limit().format(dateFormatter) : "-";
    String startTime = exam.getDate_limit() != null ? exam.getDate_limit().format(timeFormatter) : "00:00";
    String endTime = exam.getDate_limit() != null ? exam.getDate_limit().plusHours(2).format(timeFormatter) : "00:00";

    List<TeacherSubmissionDTO> studentList = new ArrayList<>();

    for (String id : classroom.getStudents_id()) {
      UserEntity student = userRepo.findById(id).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado.")
      );

      SubmissionEntity submission = submissionRepo.findByActivityIdAndStudentId(examId, student.getId())
        .orElse(null);

      GradesEntity gradeEntity = gradesRepo.findByActivityIdAndStudentId(examId, student.getId())
        .orElse(null);

      String submissionId = (submission != null) ? submission.getId() : null;
      String fileUrl = (submission != null) ? submission.getFile_url() : null;
      String submissionDate = (submission != null && submission.getSubmission_date() != null)
        ? submission.getSubmission_date().toString() : null;

      boolean isLate = false;
      String status = (submission != null) ? "Presente" : "Ausente";

      float grade = (gradeEntity != null && gradeEntity.getQualification() != null)
        ? gradeEntity.getQualification()
        : 0.0f;

      TeacherSubmissionDTO studentSubmission = new TeacherSubmissionDTO(
        student.getId(),
        student.getName(),
        submissionId,
        fileUrl,
        submissionDate,
        isLate,
        grade,
        status,
        exam.getTitle()
      );

      studentList.add(studentSubmission);
    }

    return new ExamDTO(
      examDate,
      startTime,
      endTime,
      examType,
      studentList.size(),
      studentList,
      "OK",
      0.0f
    );
  }
}
