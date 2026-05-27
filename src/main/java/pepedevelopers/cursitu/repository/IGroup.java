package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.GroupEntity;

public interface IGroup extends MongoRepository<GroupEntity, String> { }
