package pepedevelopers.cursitu.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
@Data
public class UserEntity {
    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String dni;

    @Indexed
    private String role;

    private List<String> comission;
    private Integer classroom_number;
    private List<String> subjects_id;
    private Boolean hasGroup;
}
