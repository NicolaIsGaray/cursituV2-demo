package pepedevelopers.cursitu.controller.subject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.dto.TopicDTO;
import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;
import pepedevelopers.cursitu.repository.ITopics;
import pepedevelopers.cursitu.service.TopicService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/topics")
@CrossOrigin(origins = "*")
public class TopicController {
  private final ITopics topicsRepo;

  @Autowired
  private TopicService topicService;

  public TopicController(ITopics topicsRepo) {
    this.topicsRepo = topicsRepo;
  }

  @PostMapping
  public ResponseEntity<TopicEntity> createTopic(@RequestBody TopicDTO request) {
    TopicEntity newTopic = topicService.submitTopic(
      request.mode(),
      request.topic(),
      request.assignment(),
      request.classroom_id()
    );
    return ResponseEntity.ok(newTopic);
  }

  @GetMapping
  public ResponseEntity<List<TopicEntity>> getAllTopics() {
    return ResponseEntity.ok(topicsRepo.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<TopicEntity> getTopicById(@PathVariable String id) {
    TopicEntity topic = topicsRepo.findById(id).orElse(null);

    return topic != null ? ResponseEntity.ok(topic) : ResponseEntity.notFound().build();
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifyTopic(@PathVariable String id, @RequestBody TopicDTO updatedTopic) {
    topicService.modifyTopic(id,
      updatedTopic.mode(),
      updatedTopic.topic(),
      updatedTopic.assignment()
      );
    return ResponseEntity.ok(Map.of("message", "Clase modificada con éxito."));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteTopic(@PathVariable String id) {
    topicService.deleteTopicAndAssignments(id);
    return ResponseEntity.ok(Map.of("message", "Tema eliminado con éxito."));
  }
}
