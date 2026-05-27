package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.subject_submodel.TopicEntity;

import java.util.Optional;

public interface ITopics extends MongoRepository<TopicEntity, String> {
  Optional<TopicEntity> findByAssignmentId(String activityId);
}
