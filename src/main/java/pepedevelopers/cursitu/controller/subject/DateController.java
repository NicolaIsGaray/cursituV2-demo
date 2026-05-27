package pepedevelopers.cursitu.controller.subject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.subject_submodel.DateEntity;
import pepedevelopers.cursitu.repository.IDate;
import pepedevelopers.cursitu.service.DateService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dates")
@CrossOrigin(origins = "*")
public class DateController {
  private final IDate dateRepo;

  @Autowired
  private DateService dateService;

  public DateController(IDate dateRepo) {
    this.dateRepo = dateRepo;
  }

  @PostMapping
  public ResponseEntity<DateEntity> createDateEvent(@RequestBody DateEntity dateEvent) {
    return ResponseEntity.ok(dateRepo.save(dateEvent));
  }

  @GetMapping
  public ResponseEntity<List<DateEntity>> getAllDateEvents() {
    return ResponseEntity.ok(dateRepo.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<DateEntity> getDateEventById(@PathVariable String id) {
    return ResponseEntity.ok(dateRepo.findById(id).orElse(null));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifyDateEvent(@PathVariable String id, @RequestBody DateEntity updates) {
    dateService.updateDateEvent(id, updates);
    return ResponseEntity.ok(Map.of("message", "Fecha actualizada con éxito."));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteDateEvent(@PathVariable String id) {
    dateRepo.deleteById(id);

    return ResponseEntity.ok(Map.of("message", "Fecha eliminada con éxito."));
  }
}
