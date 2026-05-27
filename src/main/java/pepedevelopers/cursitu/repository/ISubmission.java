package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.subject_submodel.SubmissionEntity;

import java.util.List;
import java.util.Optional;

public interface ISubmission extends MongoRepository<SubmissionEntity, String> {
  Optional<SubmissionEntity> findByActivityId(String activityId);
  Optional<SubmissionEntity> findByActivityIdAndStudentId(String activityId, String studentId);
  Long countDistinctSentByActivityId(String taskId);
  List<SubmissionEntity> findByActivityIdAndStudentIdIn(String activityId, List<String> studentIds);
}
