package pepedevelopers.cursitu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pepedevelopers.cursitu.model.GroupEntity;
import pepedevelopers.cursitu.repository.IGroup;
import pepedevelopers.cursitu.service.GroupService;

import java.util.List;
import java.util.Map;

import static java.lang.IO.println;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {
  private final IGroup groupRepo;

  @Autowired
  private GroupService groupService;

  private GroupController(IGroup groupRepo) {
      this.groupRepo = groupRepo;
  }

  @PostMapping
  public ResponseEntity<GroupEntity> createGroup(@RequestBody GroupEntity group) {
      return new ResponseEntity<>(groupService.createNewGroup(group), HttpStatus.CREATED);
  }

  @GetMapping("/{id}")
  public ResponseEntity<GroupEntity> searchGroup(@PathVariable String id) {
      GroupEntity group = groupRepo.findById(id).orElse(null);

      return group != null ? ResponseEntity.ok(group) : ResponseEntity.notFound().build();
  }

  @GetMapping
  public ResponseEntity<List<GroupEntity>> allGroups() {
      return ResponseEntity.ok(groupRepo.findAll());
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> modifyGroup(@PathVariable String id, @RequestBody GroupEntity groupToUpdate) {
    groupService.updateGroup(id, groupToUpdate);

    return ResponseEntity.ok(Map.of("message", "Grupo modificado con éxito."));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteGroup(@PathVariable String id) {
    groupService.deleteGroupAndRemoveMembers(id);

    return ResponseEntity.ok(Map.of("message", "Grupo eliminado con éxito."));
  }

  @GetMapping("/subject/{id}")
  public ResponseEntity<List<GroupEntity>> getGroupsInSubject(@PathVariable String id) {
    return ResponseEntity.ok(groupService.obtainGroupListBySubject(id));
  }
}
