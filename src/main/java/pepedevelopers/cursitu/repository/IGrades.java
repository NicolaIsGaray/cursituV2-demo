package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.subject_submodel.GradesEntity;

import java.util.List;
import java.util.Optional;

public interface IGrades extends MongoRepository<GradesEntity, String> {
  long countByActivityIdAndStudentIdIn(String activityId, List<String> studentIds);
  List<GradesEntity> findByActivityIdAndStudentIdIn(String activityId, List<String> studentIds);
  Optional<GradesEntity> findByActivityIdAndStudentId(String activityId, String studentId);
}
