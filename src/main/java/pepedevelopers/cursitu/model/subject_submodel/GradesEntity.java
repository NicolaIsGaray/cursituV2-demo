package pepedevelopers.cursitu.model.subject_submodel;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "student_grades")
@Data
public class GradesEntity {
  @Id
  private String id;

  private String studentId;
  private String activityId;
  private Float qualification;
}
