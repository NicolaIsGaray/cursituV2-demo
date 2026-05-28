package pepedevelopers.cursitu.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.SubjectEntity;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.repository.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
public class SubjectService {
  private final ISubject subjectRepo;
  private final IUser userRepo;
  private final IClassroom classroomRepo;
  private final ITopics topicsRepo;
  private final IAssignment assignmentRepo;

  public SubjectService(ISubject subjectRepo, IUser userRepo, IClassroom classroomRepo, ITopics topicsRepo, IAssignment assignmentRepo) {
    this.subjectRepo = subjectRepo;
    this.userRepo = userRepo;
    this.classroomRepo = classroomRepo;
    this.topicsRepo = topicsRepo;
    this.assignmentRepo = assignmentRepo;
  }

  @Transactional
  public SubjectEntity createSubject(SubjectEntity subject) {
    subject.setIsSuspended(false);

    // 1. Guardar la materia inicialmente para obtener su ID
    SubjectEntity savedSubject = subjectRepo.save(subject);

    // 2. Buscar todos los alumnos que se van a vincular
    List<UserEntity> students = userRepo.findByRole("ALUMNO");
    List<String> studentIds = new ArrayList<>();

    if (students != null && !students.isEmpty()) {
      for (UserEntity student : students) {
        // Vinculación 1: Agrega el ID de la materia al alumno
        assignSubjectToUser(student.getId(), savedSubject.getId());
        // Colectamos los IDs de los alumnos para el aula
        studentIds.add(student.getId());
      }
    }

    // 3. Crear y asociar el Aula Virtual (Classroom) con sus alumnos ya cargados
    ClassroomEntity newClassroom = new ClassroomEntity();
    newClassroom.setSubject_id(savedSubject.getId());

    // Vinculación 2: Seteamos la lista de alumnos directamente al aula
    newClassroom.setStudents_id(studentIds);

    ClassroomEntity savedClassroom = classroomRepo.save(newClassroom);

    // 4. Vincular el ID del aula virtual a la materia
    savedSubject.setClassroom_id(savedClassroom.getId());
    subjectRepo.save(savedSubject);

    // 5. Asignar la materia al profesor que la dicta
    assignSubjectToUser(subject.getProfessor_id(), savedSubject.getId());

    return savedSubject;
  }

  @Transactional
  public SubjectEntity updateSubject(String id, SubjectEntity update) {
    SubjectEntity current = subjectRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materia no encontrada."));

    if (!current.getProfessor_id().equals(update.getProfessor_id())) {
      removeSubjectToUser(current.getProfessor_id(), id);
      assignSubjectToUser(update.getProfessor_id(), id);
    }

    current.setSubject_name(update.getSubject_name() == null ? current.getSubject_name() : update.getSubject_name());
    current.setColor(update.getColor() == null ? current.getColor() : update.getColor());
    current.setProfessor_id(update.getProfessor_id() == null ? current.getProfessor_id() : update.getProfessor_id());
    current.setAcademic_period(update.getAcademic_period() == null ? current.getAcademic_period() : update.getAcademic_period());
    current.setYear_level(update.getYear_level() == null ? current.getYear_level() : update.getYear_level());
    current.setSchedule(update.getSchedule() == null ? current.getSchedule() : update.getSchedule());

    return subjectRepo.save(current);
  }

  @Transactional
  public void toggleSuspension(String id, boolean suspend) {
    SubjectEntity subject = subjectRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materia no encontrada."));

    subject.setIsSuspended(suspend);
    subjectRepo.save(subject);
  }

  @Transactional
  public void deleteInCascade(String subjectId) {
    SubjectEntity subject = subjectRepo.findById(subjectId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materia no encontrada."));

    if (subject.getClassroom_id() != null) {
      classroomRepo.findById(subject.getClassroom_id()).ifPresent(classroom -> {
        List<String> topicsId = classroom.getTopics_id();
        if (topicsId != null && !topicsId.isEmpty()) {
          for (String id : topicsId) {
            topicsRepo.findById(id).ifPresent(topic -> {
              if (topic.getAssignmentId() != null) {
                assignmentRepo.deleteById(topic.getAssignmentId());
              }
            });
            topicsRepo.deleteById(id);
          }
        }
        classroomRepo.deleteById(classroom.getId());
      });
    }

    userRepo.findAll().forEach(user -> {
      removeSubjectToUser(user.getId(), subjectId);
    });

    subjectRepo.deleteById(subjectId);
  }

  @Transactional
  public ClassroomEntity getSubjectClassroom(String subjectId) {
    SubjectEntity subject = subjectRepo.findById(subjectId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materia no encontrada."));

    return classroomRepo.findById(subject.getClassroom_id()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));
  }

  private void assignSubjectToUser(String userId, String subjectId) {
    userRepo.findById(userId).ifPresent(user -> {
      if (user.getSubjects_id() == null || !user.getSubjects_id().contains(subjectId)) {
        user.getSubjects_id().add(subjectId);
        userRepo.save(user);
      }
    });
  }

  private void removeSubjectToUser(String userId, String subjectId) {
    userRepo.findById(userId).ifPresent(user -> {
      if (user.getSubjects_id() != null) {
        user.getSubjects_id().remove(subjectId);
        userRepo.save(user);
      }
    });
  }

  public List<UserEntity> professorInSubjects(List<String> ids) {
    List<UserEntity> professorsFound = new ArrayList<>();

    if (ids == null || ids.isEmpty()) {
      log.info("No hay IDs. Creando lista vacia...");
      return professorsFound;
    }

    List<SubjectEntity> subjectsFound = subjectRepo.findByIdInAndIsSuspendedFalse(ids);

    List<String> professorIds = subjectsFound.stream()
      .map(SubjectEntity::getProfessor_id)
      .filter(profId -> profId != null && !profId.isEmpty())
      .distinct()
      .toList();

    if (!professorIds.isEmpty()) {
      professorsFound = userRepo.findByIdIn(professorIds);
    }

    return professorsFound;
  }
}
