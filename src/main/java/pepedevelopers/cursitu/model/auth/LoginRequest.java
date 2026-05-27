package pepedevelopers.cursitu.model.auth;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class LoginRequest {
  private String dni;
  private String password;
}
