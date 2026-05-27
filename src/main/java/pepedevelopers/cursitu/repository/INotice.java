package pepedevelopers.cursitu.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pepedevelopers.cursitu.model.NoticeEntity;

import java.util.List;
import java.util.Optional;

public interface INotice extends MongoRepository<NoticeEntity, String> {
  Optional<List<NoticeEntity>> findBySenderId(String senderId);
}
