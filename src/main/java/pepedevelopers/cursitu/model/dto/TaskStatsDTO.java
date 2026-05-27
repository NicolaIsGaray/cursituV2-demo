package pepedevelopers.cursitu.model.dto;

public record TaskStatsDTO(
  long totalStudents,
  long provided,
  long not_provided,
  long corrected
) {
}
