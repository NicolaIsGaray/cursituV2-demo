package pepedevelopers.cursitu.model.dto;

import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;
import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;

public record TopicDTO(
  TopicEntity topic,
  AssignmentEntity assignment,
  String mode,

  String classroom_id
) {}
