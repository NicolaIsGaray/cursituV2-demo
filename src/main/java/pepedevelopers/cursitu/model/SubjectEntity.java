package pepedevelopers.cursitu.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import pepedevelopers.cursitu.model.subject_submodel.DateEntity;
import pepedevelopers.cursitu.model.subject_submodel.SubjectSchedule;

import java.util.List;

@Document(collection = "subjects")
@Data
public class SubjectEntity {
    @Id
    private String id;

    private String subject_name;
    private String color;
    private String professor_id;
    private String classroom_id;
    private Integer year_level;
    private Integer[] academic_period;

    private Boolean isSuspended;

    private List<DateEntity> important_dates;

    private List<SubjectSchedule> schedule;
}
