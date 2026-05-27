package pepedevelopers.cursitu.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.NoticeEntity;
import pepedevelopers.cursitu.repository.INotice;

import java.util.ArrayList;
import java.util.List;

@Service
public class NoticeService {
  private final INotice noticeRepo;

  public NoticeService(INotice noticeRepo) {
    this.noticeRepo = noticeRepo;
  }

  @Transactional
  public List<NoticeEntity> obtainSenderNotices(String senderId) {
    return noticeRepo.findBySenderId(senderId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avisos del emisor no encontrados.")
    );
  }

  @Transactional
  public void updateNotice(String id, NoticeEntity updates) {
    NoticeEntity notice = noticeRepo.findById(id).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aviso no encontrado.")
    );

    notice.setTitle(updates.getTitle() == null ? notice.getTitle() : updates.getTitle());
    notice.setMessage(updates.getMessage() == null ? notice.getMessage() : updates.getMessage());
    notice.setRead_by(new ArrayList<>());
    notice.setType(updates.getType() == null ? "info" : updates.getType());
    notice.setCreated_at(updates.getCreated_at() == null ? notice.getCreated_at() : updates.getCreated_at());

    noticeRepo.save(notice);
  }
}
