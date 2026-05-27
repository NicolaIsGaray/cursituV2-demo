package pepedevelopers.cursitu.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Document(collection = "notices")
@Data
public class NoticeEntity {
  @Id
  private String id;

  private String title;
  private String type;
  private String message;
  private String senderId;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private LocalDate created_at;

  private List<String> read_by;
}
