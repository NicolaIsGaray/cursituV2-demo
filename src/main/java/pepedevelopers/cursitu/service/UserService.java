package pepedevelopers.cursitu.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.SubjectEntity;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.repository.IClassroom;
import pepedevelopers.cursitu.repository.ISubject;
import pepedevelopers.cursitu.repository.IUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class UserService {
  private final IUser userRepo;
  private final ISubject subjectRepo;
  private final IClassroom classroomRepo;

  public UserService(IUser userRepo, ISubject subjectRepo, IClassroom classroomRepo) {
    this.userRepo = userRepo;
    this.subjectRepo = subjectRepo;
    this.classroomRepo = classroomRepo;
  }

  @Transactional
  public UserEntity createUser(UserEntity user) {
    List<UserEntity> checkList = userRepo.findAll();

    checkList.forEach(u -> {
      if (user.getDni().equals(u.getDni())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya hay un alumno registrado con ese DNI.");
      }
    });

    if ("ALUMNO".equals(user.getRole()) && user.getComission().size() > 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un alumno no puede tener múltiples comisiones.");
    }

    user.setPassword(user.getDni());
    user.setHasGroup(false);

    List<String> userSubjects = user.getSubjects_id();

    if (userSubjects != null && !userSubjects.isEmpty()) {
      List<SubjectEntity> subjects = subjectRepo.findAllById(userSubjects);

      List<String> classroomIds = subjects.stream()
        .map(SubjectEntity::getClassroom_id)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

      List<ClassroomEntity> classrooms = classroomRepo.findAllById(classroomIds);

      classrooms.forEach(classroom -> {
        List<String> students = classroom.getStudents_id();

        if (students == null) {
          students = new ArrayList<>();
        } else {
          students = new ArrayList<>(students);
        }

        if (!students.contains(user.getId()) && "ALUMNO".equals(user.getRole())) {
          students.add(user.getId());
          classroom.setStudents_id(students);
        }
      });

      classroomRepo.saveAll(classrooms);
    }

    return userRepo.save(user);
  }

  @Transactional
  public UserEntity updateUser(String id, UserEntity update) {
    UserEntity updatedUser = userRepo.findById(id).orElse(null);

    if (updatedUser == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado.");
    }

    if ("ALUMNO".equals(update.getRole()) && update.getComission().size() > 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un alumno solo puede tener una comisión.");
    }

    List<String> oldSubjectsIds = updatedUser.getSubjects_id() != null
      ? new ArrayList<>(updatedUser.getSubjects_id())
      : new ArrayList<>();

    updatedUser.setName(update.getName() == null ? updatedUser.getName() : update.getName());
    updatedUser.setEmail(update.getEmail() == null ? updatedUser.getEmail() : update.getEmail());
    updatedUser.setPassword(update.getPassword() == null ? updatedUser.getPassword() : update.getPassword());
    updatedUser.setDni(update.getDni() == null ? updatedUser.getDni() : update.getDni());
    updatedUser.setRole(update.getRole() == null ? updatedUser.getRole() : update.getRole());
    updatedUser.setComission(update.getComission() == null ? updatedUser.getComission() : update.getComission());
    updatedUser.setClassroom_number(update.getClassroom_number() == null ? updatedUser.getClassroom_number() : update.getClassroom_number());
    updatedUser.setSubjects_id(update.getSubjects_id() == null ? updatedUser.getSubjects_id() : update.getSubjects_id());
    updatedUser.setHasGroup(update.getHasGroup() == null ? updatedUser.getHasGroup() : update.getHasGroup());

    if ("ALUMNO".equals(updatedUser.getRole())) {
      List<String> newSubjectsIds = updatedUser.getSubjects_id() != null ? updatedUser.getSubjects_id() : new ArrayList<>();

      List<String> removedSubjectsIds = oldSubjectsIds.stream()
        .filter(subId -> !newSubjectsIds.contains(subId))
        .toList();

      if (!removedSubjectsIds.isEmpty()) {
        List<SubjectEntity> removedSubjects = subjectRepo.findAllById(removedSubjectsIds);
        List<String> removedClassroomIds = removedSubjects.stream()
          .map(SubjectEntity::getClassroom_id)
          .filter(Objects::nonNull)
          .distinct()
          .toList();

        if (!removedClassroomIds.isEmpty()) {
          List<ClassroomEntity> classroomsToRemoveFrom = classroomRepo.findAllById(removedClassroomIds);
          classroomsToRemoveFrom.forEach(classroom -> {
            List<String> students = classroom.getStudents_id();
            if (students != null && students.contains(updatedUser.getId())) {
              List<String> updatedStudents = new ArrayList<>(students);
              updatedStudents.remove(updatedUser.getId());
              classroom.setStudents_id(updatedStudents);
            }
          });
          classroomRepo.saveAll(classroomsToRemoveFrom);
        }
      }

      if (!newSubjectsIds.isEmpty()) {
        List<SubjectEntity> subjects = subjectRepo.findAllById(newSubjectsIds);
        List<String> classroomIds = subjects.stream()
          .map(SubjectEntity::getClassroom_id)
          .filter(Objects::nonNull)
          .distinct()
          .toList();

        List<ClassroomEntity> classrooms = classroomRepo.findAllById(classroomIds);
        classrooms.forEach(classroom -> {
          List<String> students = classroom.getStudents_id();
          if (students == null) {
            students = new ArrayList<>();
          } else {
            students = new ArrayList<>(students);
          }

          if (!students.contains(updatedUser.getId())) {
            students.add(updatedUser.getId());
            classroom.setStudents_id(students);
          }
        });
        classroomRepo.saveAll(classrooms);
      }
    }

    return userRepo.save(updatedUser);
  }

}
