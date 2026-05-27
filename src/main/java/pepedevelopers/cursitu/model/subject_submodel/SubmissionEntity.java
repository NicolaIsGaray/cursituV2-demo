package pepedevelopers.cursitu.model.subject_submodel;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "submissions")
public class SubmissionEntity {
  @Id
  private String id;

  private String activityId;
  private String studentId;
  private String file_url;
  private String comment;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime submission_date;

  private String status;
  private Boolean isLate;

}
