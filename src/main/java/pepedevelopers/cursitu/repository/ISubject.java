package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.SubjectEntity;

import java.util.List;

public interface ISubject extends MongoRepository<SubjectEntity, String> {
  List<SubjectEntity> findByIdInAndIsSuspendedFalse(List<String> ids);
}
