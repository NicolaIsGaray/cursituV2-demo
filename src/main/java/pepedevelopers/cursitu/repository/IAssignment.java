package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.subject_submodel.AssignmentEntity;

public interface IAssignment extends MongoRepository<AssignmentEntity, String> {
}
