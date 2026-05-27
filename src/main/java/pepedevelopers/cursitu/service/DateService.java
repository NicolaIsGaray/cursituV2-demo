package pepedevelopers.cursitu.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pepedevelopers.cursitu.model.subject_submodel.DateEntity;
import pepedevelopers.cursitu.repository.IDate;

@Service
public class DateService {
  private final IDate dateRepo;

  public DateService(IDate dateRepo) {
    this.dateRepo = dateRepo;
  }

  @Transactional
  public void updateDateEvent(String id, DateEntity updates) {
    DateEntity dateEntity = dateRepo.findById(id).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fecha no encontrada.")
    );

    dateEntity.setTitle(updates.getTitle() == null ? dateEntity.getTitle() : updates.getTitle());
    dateEntity.setDate(updates.getDate() == null ? dateEntity.getDate() : updates.getDate());
    dateEntity.setEvent(updates.getEvent() == null ? dateEntity.getEvent() : updates.getEvent());
    dateEntity.setImportant(updates.getImportant() == null ? dateEntity.getImportant() : updates.getImportant());

    dateRepo.save(dateEntity);
  }
}
