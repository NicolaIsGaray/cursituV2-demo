package pepedevelopers.cursitu.model.dto;

import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;

import java.util.List;

public record ClassroomDTO(
  String id,
  String subjectName,
  List<TopicEntity> topics
) {
}
