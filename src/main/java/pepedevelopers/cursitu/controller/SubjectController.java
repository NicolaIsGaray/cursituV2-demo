package pepedevelopers.cursitu.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.SubjectEntity;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.repository.ISubject;
import pepedevelopers.cursitu.repository.IUser;
import pepedevelopers.cursitu.service.SubjectService;
import pepedevelopers.cursitu.service.UserService;

import java.util.*;

import static java.lang.IO.println;

@Slf4j
@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {
  @Autowired
  private SubjectService subjectService;

  @Autowired
  private UserService userService;

  private final ISubject subjectRepo;
  private final IUser userRepo;

  private SubjectController(ISubject iSubject, IUser userRepo) {
    this.subjectRepo = iSubject;
    this.userRepo = userRepo;
  }

  @PostMapping
  public ResponseEntity<SubjectEntity> createSubject(@RequestBody SubjectEntity subjectToCreate) {
      return new ResponseEntity<>(subjectService.createSubject(subjectToCreate), HttpStatus.CREATED);
  }

  @GetMapping("/{id}")
  public ResponseEntity<SubjectEntity> searchSubject(@PathVariable String id) {
      SubjectEntity requestedSubject = subjectRepo.findById(id).orElse(null);

      return requestedSubject != null ? ResponseEntity.ok(requestedSubject) : ResponseEntity.notFound().build();
  }

  @GetMapping
  public ResponseEntity<List<SubjectEntity>> allSubjects() {
      return ResponseEntity.ok(subjectRepo.findAll());
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifySubject(@PathVariable String id, @RequestBody SubjectEntity subjectToUpdate) {
      SubjectEntity updatedSubject = subjectService.updateSubject(id, subjectToUpdate);

      if (updatedSubject == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha podido modificar la materia");
      }

      Map<String, String> response = new HashMap<>();
      response.put("message", "Materia modificada con éxito.");

      return ResponseEntity.ok(response);
  }

  @PutMapping("/suspend/{id}")
  public ResponseEntity<?> suspendSubject(@PathVariable String id, @RequestBody boolean status) {
    subjectService.toggleSuspension(id, status);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Materia suspendida con éxito.");

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteSubject(@PathVariable String id) {
      subjectService.deleteInCascade(id);
      return ResponseEntity.ok(Map.of("message", "Materia eliminada con éxito."));
  }

  @GetMapping("/subject/{id}/classroom")
  public ResponseEntity<ClassroomEntity> getClassroomInSubject(@PathVariable String id) {
    return ResponseEntity.ok(subjectService.getSubjectClassroom(id));
  }

  @GetMapping("/student/{id}")
  public ResponseEntity<List<SubjectEntity>> getStudentSubjects(@PathVariable String id) {
    UserEntity student = userRepo.findById(id).orElse(null);

    if (student == null) {
      log.info("Error. No se ha podido encontrar al estudiante.");
      return ResponseEntity.notFound().build();
    }

    List<String> subjectsIdArray = student.getSubjects_id();
    if (subjectsIdArray == null || subjectsIdArray.isEmpty()) {
      log.info("No hay materias vinculadas al estudiante.");
      return ResponseEntity.ok(new ArrayList<>());
    }

    List<SubjectEntity> toSend = subjectRepo.findByIdInAndIsSuspendedFalse(subjectsIdArray);
    return ResponseEntity.ok(toSend);
  }

  @GetMapping("/professor/{id}")
  public ResponseEntity<List<SubjectEntity>> getProfessorSubjects(@PathVariable String id) {
    UserEntity professor = userRepo.findById(id).orElse(null);

    if (professor == null) {
      log.info("Error. No se ha podido encontrar al profesor.");
      return ResponseEntity.notFound().build();
    }

    List<String> subjectsIdArray = professor.getSubjects_id();
    if (subjectsIdArray == null || subjectsIdArray.isEmpty()) {
      log.info("No hay materias vinculadas al profesor.");
      return ResponseEntity.ok(new ArrayList<>());
    }

    List<SubjectEntity> toSend = subjectRepo.findByIdInAndIsSuspendedFalse(subjectsIdArray);
    return ResponseEntity.ok(toSend);
  }

  @GetMapping("/professor/in")
  public ResponseEntity<List<UserEntity>> getProfessorInSubjects(@RequestParam List<String> ids) {
    List<UserEntity> professorsFound = subjectService.professorInSubjects(ids);

    return ResponseEntity.ok(professorsFound);
  }
}
