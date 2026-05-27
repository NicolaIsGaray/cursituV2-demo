package pepedevelopers.cursitu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.service.ExcelService;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MainController {
  @Autowired
  private ExcelService excelService;

  @GetMapping("/excel/student-list/{classroomId}")
  public ResponseEntity<InputStreamResource> downloadStudentList(@PathVariable String classroomId) {
    try {
      ByteArrayInputStream in = excelService.exportSubjectStudents(classroomId);

      HttpHeaders headers = new HttpHeaders();
      headers.add("Content-Disposition", "attachment; filename=alumnos.xlsx");

      return ResponseEntity.ok()
        .headers(headers)
        .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(new InputStreamResource(in));
    } catch (IOException e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}
