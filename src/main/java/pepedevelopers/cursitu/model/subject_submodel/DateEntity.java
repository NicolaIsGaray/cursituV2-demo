package pepedevelopers.cursitu.model.subject_submodel;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class DateEntity {
  @Id
  private String id;

  private String title;
  private String event;
  private Boolean important;
  private LocalDateTime date;
  private String subjectId;
}
