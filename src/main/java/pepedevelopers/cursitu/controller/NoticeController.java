package pepedevelopers.cursitu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.NoticeEntity;
import pepedevelopers.cursitu.repository.INotice;
import pepedevelopers.cursitu.service.NoticeService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {
  private final INotice noticeRepo;

  @Autowired
  private NoticeService noticeService;

  public NoticeController(INotice noticeRepo) {
    this.noticeRepo = noticeRepo;
  }

  @PostMapping
  public ResponseEntity<NoticeEntity> createNotice(@RequestBody NoticeEntity newNotice) {
    return new ResponseEntity<>(noticeRepo.save(newNotice), HttpStatus.CREATED);
  }

  @GetMapping("/{id}")
  public ResponseEntity<NoticeEntity> getNoticeById(@PathVariable String id) {
    NoticeEntity requestedNotice = noticeRepo.findById(id).orElse(null);

    return requestedNotice != null ? ResponseEntity.ok(requestedNotice) : ResponseEntity.notFound().build();
  }

  @GetMapping
  public ResponseEntity<List<NoticeEntity>> getAllNotices() {
    return ResponseEntity.ok(noticeRepo.findAll());
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifyNotice(@PathVariable String id, @RequestBody NoticeEntity updates) {
    noticeService.updateNotice(id, updates);

    return ResponseEntity.ok(Map.of("message", "Anuncio actualizado con éxito."));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteNotice(@PathVariable String id) {
    NoticeEntity noticeToDelete = noticeRepo.findById(id).orElse(null);

    if (noticeToDelete == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el anuncio a borrar.");
    }

    noticeRepo.delete(noticeToDelete);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Anuncio eliminado con éxito.");

    return ResponseEntity.ok(response);
  }

  @GetMapping("/sender/{senderId}")
  public ResponseEntity<List<NoticeEntity>> getSenderNotices(@PathVariable String senderId) {
    return ResponseEntity.ok(noticeService.obtainSenderNotices(senderId));
  }
}
