package pepedevelopers.cursitu.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "groups")
@Data
public class GroupEntity {
    @Id
    private String id;

    private List<String> members_id;
    private List<String> member_names;
    private Integer number;
    private Integer group_limit;
    private String subject_id;
    private String professor_id;
    private String classroom_id;
}
