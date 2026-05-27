package pepedevelopers.cursitu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.repository.IUser;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.IO.println;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
  @Autowired
  private UserService userService;

  private final IUser userRepo;

  public UserController(IUser userRepo) {
    this.userRepo = userRepo;
  }

  @PostMapping
  public ResponseEntity<UserEntity> addUser(@RequestBody UserEntity user) {
    return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
  }

  @GetMapping("/{id}")
  public UserEntity searchUser(@PathVariable String id) {
      return userRepo.findById(id).orElse(null);
  }

  @GetMapping("/dni/{dni}")
  public List<UserEntity> searchByDni(@PathVariable String dni) { return userRepo.findByDniContaining(dni).orElse(null); }

  @GetMapping
  public ResponseEntity<List<UserEntity>> allUsers() {
      return ResponseEntity.ok(userRepo.findAll());
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserEntity userToUpdate) {
    UserEntity updated = userService.updateUser(id, userToUpdate);

    if (updated == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se ha podido modificar el usuario.");
    }

    Map<String, String> response = new HashMap<>();
    response.put("message", "Usuario modificado.");

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
    userRepo.deleteById(id);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Usuario eliminado con éxito.");
    return ResponseEntity.ok(response);
  }

  @GetMapping("/students")
  public List<UserEntity> getOnlyStudents() {
    return userRepo.findByRole("ALUMNO");
  }

  @GetMapping("/professors")
  public List<UserEntity> getOnlyProfessors() {
    return userRepo.findByRole("DOCENTE");
  }
}
