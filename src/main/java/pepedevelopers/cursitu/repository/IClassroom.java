package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import pepedevelopers.cursitu.model.ClassroomEntity;

import java.util.List;
import java.util.Optional;

public interface IClassroom extends MongoRepository<ClassroomEntity, String> {
  @Query("{ 'topics_id': ?0 }")
  Optional<ClassroomEntity> findByTopicId(String topicId);
}
