package pepedevelopers.cursitu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.dto.ClassroomDTO;
import pepedevelopers.cursitu.model.dto.ExamDTO;
import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;
import pepedevelopers.cursitu.repository.IClassroom;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.service.AssignmentService;
import pepedevelopers.cursitu.service.ClassroomService;

import java.util.*;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {
  @Autowired
  private ClassroomService classroomService;

  @Autowired
  private AssignmentService assignmentService;

  private final IClassroom classRepo;

  public ClassroomController(IClassroom classRepo) {
      this.classRepo = classRepo;
  }

  @PostMapping
  public ResponseEntity<ClassroomEntity> createClassroom(@RequestBody ClassroomEntity classroom) {
      return new ResponseEntity<>(classRepo.save(classroom), HttpStatus.CREATED);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ClassroomEntity> searchClassroom(@PathVariable String id) {
      ClassroomEntity classroom = classRepo.findById(id).orElse(null);
      return classroom != null ? ResponseEntity.ok(classroom) : ResponseEntity.notFound().build();
  }

  @GetMapping
  public ResponseEntity<List<ClassroomEntity>> getAllClassrooms() {
      return ResponseEntity.ok(classRepo.findAll());
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifyClassroom(@PathVariable String id, @RequestBody ClassroomEntity updatedData) {
    classroomService.modifyClassroom(id, updatedData);
    return ResponseEntity.ok(Map.of("message", "Curso modificado con éxito."));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteClassroom(@PathVariable String id) {
      ClassroomEntity classroom = classRepo.findById(id).orElse(null);

      if (classroom == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Curso no encontrado.");

      classRepo.delete(classroom);
      Map<String, String> response = new HashMap<>();
      response.put("message", "Curso eliminado con éxito.");

      return ResponseEntity.ok(response);
  }

  @GetMapping("/activities/{id}")
  public ResponseEntity<ClassroomDTO> obtainActivities(@PathVariable String id) {
    return ResponseEntity.ok(classroomService.getClassroomDetailsForView(id));
  }

  @GetMapping("/tasks/{id}")
  public ResponseEntity<List<AssignmentEntity>> obtainOnlyTasks(@PathVariable String id) {
    List<AssignmentEntity> taskList = classroomService.getOnlyTasksInClassroom(id);

    if (taskList == null || taskList.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(taskList);
  }

  @GetMapping("/exams/{id}")
  public ResponseEntity<List<AssignmentEntity>> obtainOnlyExams(@PathVariable String id) {
    List<AssignmentEntity> taskList = classroomService.getOnlyExamsInClassroom(id);

    if (taskList == null || taskList.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(taskList);
  }

  @GetMapping("/{classroomId}/exams/{examId}")
  public ResponseEntity<ExamDTO> getExamDetails(
    @PathVariable String classroomId,
    @PathVariable String examId,
    @RequestParam(name = "examType") String examType) {

    ExamDTO examDetails = classroomService.getExamDetails(classroomId, examId, examType);

    if (examDetails == null) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(examDetails);
  }

  @GetMapping("/students/{classroomId}")
  public ResponseEntity<List<UserEntity>> getStudentsInClassroom(@PathVariable String classroomId) {
    return ResponseEntity.ok(classroomService.obtainStudentsInClassroom(classroomId));
  }
}
