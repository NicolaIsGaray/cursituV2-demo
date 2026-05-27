package pepedevelopers.cursitu.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.ClassroomEntity;
import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;
import pepedevelopers.cursitu.model.subject_submodel.SubmissionEntity;
import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;
import pepedevelopers.cursitu.repository.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class TopicService {
  private final ITopics topicRepo;
  private final IClassroom classroomRepo;
  private final IAssignment assignmentRepo;
  private final ISubmission submissionRepo;
  private final IGrades gradeRepo;

  @Autowired
  private ClassroomService classroomService;

  public TopicService(ITopics topicRepo, IClassroom classroomRepo, IAssignment assignmentRepo, ISubmission submissionRepo, IGrades gradeRepo) {
    this.topicRepo = topicRepo;
    this.classroomRepo = classroomRepo;
    this.assignmentRepo = assignmentRepo;
    this.submissionRepo = submissionRepo;
    this.gradeRepo = gradeRepo;
  }

  @Transactional
  public TopicEntity submitTopic(String mode, TopicEntity newTopic, AssignmentEntity newAssignment, String classroomId) {
    if ("entregable".equals(mode) && newAssignment != null) {
      AssignmentEntity savedAssignment = assignmentRepo.save(newAssignment);
      newTopic.setAssignmentId(savedAssignment.getId());
    }
    else {
      newTopic.setAssignmentId(null);
    }

    TopicEntity createdTopic = topicRepo.save(newTopic);

    ClassroomEntity classroom = classroomRepo.findById(classroomId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));

    List<String> topicsId = Optional.ofNullable(classroom.getTopics_id())
      .orElseGet(ArrayList::new);

    if (!topicsId.contains(createdTopic.getId())) {
      topicsId.add(createdTopic.getId());
      classroom.setTopics_id(topicsId);
      classroomRepo.save(classroom);
    }

    return createdTopic;
  }

  @Transactional
  public void modifyTopic(String id, String mode, TopicEntity updates, AssignmentEntity assignment) {
    TopicEntity modified = topicRepo.findById(id).orElse(null);

    if (modified == null) throw  new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada.");

    if ("teorico".equals(mode) && assignment == null) {
      assignmentRepo.findById(modified.getAssignmentId()).ifPresent(assignmentRepo::delete);
      modified.setAssignmentId(null);
    } else if ("entregable".equals(mode) && assignment != null) {
      AssignmentEntity newAssignment = assignmentRepo.save(assignment);
      modified.setAssignmentId(newAssignment.getId());
    }

    modified.setTitle(updates.getTitle() == null ? modified.getTitle() : updates.getTitle());
    modified.setContent(updates.getContent() == null ? modified.getContent() : updates.getContent());

    topicRepo.save(modified);
  }

  @Transactional
  public void deleteTopicAndAssignments(String id) {
    TopicEntity topic = topicRepo.findById(id).orElse(null);

    if (topic == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada.");

    if (topic.getAssignmentId() != null) {
      AssignmentEntity assignmentToErase = assignmentRepo.findById(topic.getAssignmentId()).orElse(null);

      if (assignmentToErase != null) {
        submissionRepo.findByActivityId(assignmentToErase.getId()).ifPresent(submissionRepo::delete);

        assignmentRepo.delete(assignmentToErase);
      }
    }

    classroomRepo.findByTopicId(topic.getId()).ifPresent(classroom -> {
      List<String> topicsId = classroom.getTopics_id();

      if (topicsId != null) {
        topicsId.remove(topic.getId());

        classroom.setTopics_id(topicsId);
        classroomRepo.save(classroom);
      }
    });

    topicRepo.delete(topic);
  }
}
