package pepedevelopers.cursitu.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.GroupEntity;
import pepedevelopers.cursitu.model.UserEntity;
import pepedevelopers.cursitu.repository.IGroup;
import pepedevelopers.cursitu.repository.IUser;

import java.util.List;
import java.util.Objects;

@Service
public class GroupService {
  private final IGroup groupRepo;
  private final IUser userRepo;

  public GroupService(IGroup groupRepo, IUser userRepo) {
    this.groupRepo = groupRepo;
    this.userRepo = userRepo;
  }

  @Transactional
  public GroupEntity createNewGroup(GroupEntity group) {
    List<GroupEntity> groupCheck = groupRepo.findAll();

    groupCheck.forEach(check -> {
      if (Objects.equals(group.getNumber(), check.getNumber())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya hay un grupo con ese número.");
      }
    });

    List<UserEntity> groupMembers = userRepo.findAllById(group.getMembers_id());

    if (!groupMembers.isEmpty()) {
      groupMembers.forEach(member -> {
        member.setHasGroup(true);
        userRepo.save(member);
      });

      List<String> memberNames = groupMembers.stream().map(
        UserEntity::getName
      ).toList();

      group.setMember_names(memberNames);
    }

    return groupRepo.save(group);
  }

  @Transactional
  public void updateGroup(String id, GroupEntity updates) {
    GroupEntity group = groupRepo.findById(id).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo no encontrado.")
    );

    group.setNumber(updates.getNumber() == null ? group.getNumber() : updates.getNumber());
    group.setGroup_limit(updates.getGroup_limit() == null ? group.getGroup_limit() : updates.getGroup_limit());
    group.setClassroom_id(updates.getClassroom_id() == null ? group.getClassroom_id() : updates.getClassroom_id());
    group.setProfessor_id(updates.getProfessor_id() == null ? group.getProfessor_id() : updates.getProfessor_id());
    group.setSubject_id(updates.getSubject_id() == null ? group.getSubject_id() : updates.getSubject_id());

    List<String> newMemberIds = updates.getMembers_id() != null ? updates.getMembers_id() : group.getMembers_id();
    List<String> oldMemberIds = group.getMembers_id();

    List<String> removedStudentIds = oldMemberIds.stream()
      .filter(oldId -> !newMemberIds.contains(oldId))
      .toList();

    if (!removedStudentIds.isEmpty()) {
      List<UserEntity> removedMembers = userRepo.findAllById(removedStudentIds);
      removedMembers.forEach(member -> member.setHasGroup(false));
      userRepo.saveAll(removedMembers);
    }

    List<String> addedStudentIds = newMemberIds.stream()
      .filter(newId -> !oldMemberIds.contains(newId))
      .toList();

    if (!addedStudentIds.isEmpty()) {
      List<UserEntity> addedMembers = userRepo.findAllById(addedStudentIds);
      addedMembers.forEach(member -> member.setHasGroup(true));
      userRepo.saveAll(addedMembers);
    }

    group.setMembers_id(newMemberIds);

    List<UserEntity> currentMembers = userRepo.findAllById(newMemberIds);
    List<String> memberNames = currentMembers.stream()
      .map(UserEntity::getName)
      .toList();

    group.setMember_names(memberNames);

    groupRepo.save(group);
  }

  @Transactional
  public void deleteGroupAndRemoveMembers(String groupId) {
    groupRepo.findById(groupId).ifPresent(g -> {
      List<UserEntity> membersToRemove = userRepo.findAllById(g.getMembers_id());

      if (!membersToRemove.isEmpty()) {
        membersToRemove.forEach(member -> {
          member.setHasGroup(false);
          userRepo.save(member);
        });
      }

      groupRepo.delete(g);
    });
  }

  @Transactional(readOnly = true)
  public List<GroupEntity> obtainGroupListBySubject(String subjectId) {
    List<GroupEntity> groupList = groupRepo.findAll();

    if (groupList.isEmpty()) {
      return List.of();
    }

    return groupList.stream()
      .filter(group -> Objects.equals(group.getSubject_id(), subjectId))
      .toList();
  }
}
