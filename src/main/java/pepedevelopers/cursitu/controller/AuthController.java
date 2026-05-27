package pepedevelopers.cursitu.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.model.auth.LoginRequest;
import pepedevelopers.cursitu.repository.IUser;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
  private final IUser userRepo;

  public AuthController(IUser userRepo) {
    this.userRepo = userRepo;
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    
    return userRepo.findByDni(request.getDni())
      .filter(user -> user.getPassword().equals(request.getPassword()))
      .map(user -> ResponseEntity.ok(user))
      .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
  }
}
