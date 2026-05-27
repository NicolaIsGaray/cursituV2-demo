package pepedevelopers.cursitu.model.subject_submodel;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "assignments")
public class AssignmentEntity {
  @Id
  private String id;

  private String subject_id;
  private Boolean enabled_to_deliver;
  private String title;
  private String content;
  private String subject_name;
  private LocalDateTime date_limit;
  private String allowed_format;
  private String type;
  private List<String> sentBy;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime createdAt;
}
