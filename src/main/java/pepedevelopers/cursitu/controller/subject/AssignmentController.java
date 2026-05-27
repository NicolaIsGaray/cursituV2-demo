package pepedevelopers.cursitu.controller.subject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.dto.AssignmentDTO;
import pepedevelopers.cursitu.model.dto.TaskStatsDTO;
import pepedevelopers.cursitu.model.dto.TeacherSubmissionDTO;
import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;
import pepedevelopers.cursitu.model.subject_submodel.GradesEntity;
import pepedevelopers.cursitu.model.subject_submodel.SubmissionEntity;
import pepedevelopers.cursitu.repository.IAssignment;
import pepedevelopers.cursitu.service.AssignmentService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignment")
@CrossOrigin(origins = "*")
public class AssignmentController {
  @Autowired
  private AssignmentService assignmentService;

  private final IAssignment assignRepo;

  public AssignmentController(IAssignment assignRepo) {
    this.assignRepo = assignRepo;
  }

  @PostMapping
  public ResponseEntity<AssignmentEntity> addAssignment(@RequestBody AssignmentEntity newAssignment) {
    return new ResponseEntity<>(assignRepo.save(newAssignment), HttpStatus.CREATED);
  }

  @GetMapping("/{id}")
  public ResponseEntity<AssignmentEntity> getAssignmentById(@PathVariable String id) {
    AssignmentEntity request = assignRepo.findById(id).orElse(null);

    return request != null ? ResponseEntity.ok(request) : ResponseEntity.notFound().build();
  }

  @GetMapping
  public ResponseEntity<List<AssignmentEntity>> getAllAssignments() {
    List<AssignmentEntity> list = assignRepo.findAll();
    return ResponseEntity.ok(list);
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifyAssignment(@PathVariable String id, @RequestBody AssignmentEntity modified) {
    AssignmentEntity assignment = assignmentService.updateAssignment(id, modified);

    if (assignment == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha podido modificar la tarea o parcial.");
    }

    Map<String, String> response = new HashMap<>();
    response.put("message", "Tarea o Parcial modificado con éxito.");

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteAssignment(@PathVariable String id) {
    assignmentService.deleteAssignment(id);
    return ResponseEntity.ok(Map.of("message", "Actividad eliminada con éxito."));
  }

  @DeleteMapping("/single/{id}")
  public ResponseEntity<?> singleAssignmentDelete(@PathVariable String id) {
    assignRepo.deleteById(id);
    return ResponseEntity.ok(Map.of("message", "Actividad individual eliminada con éxito."));
  }

  @GetMapping("/in-topic/{id}")
  public ResponseEntity<AssignmentEntity> getAssignmentInTopic(@PathVariable String id) {
    return ResponseEntity.ok(assignmentService.getAssignmentInTopic(id));
  }

  @GetMapping("/in-subject/{id}")
  public ResponseEntity<List<AssignmentEntity>> getAssignmentsInSubject(@PathVariable String id) {
    return ResponseEntity.ok(assignmentService.getAllAssignmentsInSubject(id));
  }

  @GetMapping("/check-status")
  public ResponseEntity<Map<String, String>> checkAssignmentSubmissionStatus(@RequestParam String studentId, @RequestParam String activityId) {
    String status = assignmentService.checkSubmissionStatus(studentId, activityId);

    return ResponseEntity.ok(Map.of("status", status));
  }

  @GetMapping("/student/{id}/pending")
  public ResponseEntity<List<AssignmentDTO>> getStudentPendings(@PathVariable String id) {
    List<AssignmentDTO> list = assignmentService.getPendingAssignmentsForStudent(id);

    if (list == null || list.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(list);
  }

  @GetMapping("/{classroomId}/tasks/{taskId}/stats")
  public ResponseEntity<TaskStatsDTO> getTaskDeliveryStats(
    @PathVariable String classroomId,
    @PathVariable String taskId) {

    TaskStatsDTO stats = assignmentService.getTaskStatistics(classroomId, taskId);
    return ResponseEntity.ok(stats);
  }

  @GetMapping("/professor-table/classroom/{classroomId}/assignment/{activityId}")
  public ResponseEntity<List<TeacherSubmissionDTO>> getStudentSubmissions(
    @PathVariable String classroomId,
    @PathVariable String activityId
    ) {
    return ResponseEntity.ok(assignmentService.getAssignmentsTableForTeacher(classroomId, activityId));
  }

  @PostMapping("/professor-correction/student/{studentId}/assignment/{activityId}")
  public ResponseEntity<?> saveOrUpdateGrade(
    @PathVariable String studentId,
    @PathVariable String activityId,
    @RequestBody Float note
  ) {
    assignmentService.saveOrUpdateGrade(studentId, activityId, note);

    return ResponseEntity.ok(Map.of("message", "Nota actualizada exitosamente."));
  }

  @GetMapping("/grades")
  public ResponseEntity<List<GradesEntity>> getAllGrades() {
    return ResponseEntity.ok(assignmentService.getGrades());
  }

  @DeleteMapping("/grades/{id}")
  public ResponseEntity<?> deleteGrade(@PathVariable String id) {
    assignmentService.deleteGrade(id);
    return ResponseEntity.ok(Map.of("message", "Nota eliminada con éxito."));
  }

  @PostMapping("/submit-activity")
  public ResponseEntity<SubmissionEntity> submitAssignment(
    @RequestParam String activityId,
    @RequestParam String studentId,
    @RequestBody SubmissionEntity submission) {

    SubmissionEntity submited = assignmentService.submitActivity(activityId, studentId, submission);

    if (submited == null) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(submited);
  }

  @GetMapping("/submited")
  public ResponseEntity<List<SubmissionEntity>> getAllSubmitedAssignments() {
    return ResponseEntity.ok(assignmentService.getAllSubmited());
  }

  @DeleteMapping("/submited/{id}")
  public ResponseEntity<?> deleteSubmited(@PathVariable String id) {
    assignmentService.deleteSubmited(id);
    return ResponseEntity.ok(Map.of("message", "Entrega eliminada con éxito."));
  }
}
