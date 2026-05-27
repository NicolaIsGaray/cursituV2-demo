package pepedevelopers.cursitu.model.subject_submodel;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "topics")
public class TopicEntity {
  @Id
  private String id;

  private String title;
  private String content;
  private String assignmentId;
  private String classroom_id;
}
