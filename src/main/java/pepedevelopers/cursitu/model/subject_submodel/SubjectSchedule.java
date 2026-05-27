package pepedevelopers.cursitu.model.subject_submodel;

import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class SubjectSchedule {
  private DayOfWeek day;
  private LocalTime startTime;
  private LocalTime endTime;
}
