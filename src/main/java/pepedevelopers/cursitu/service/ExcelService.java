package pepedevelopers.cursitu.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pepedevelopers.cursitu.model.UserEntity;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;

@Service
public class ExcelService {
  @Autowired
  private ClassroomService classroomService;

  public ByteArrayInputStream exportSubjectStudents(String classroomId) throws IOException {
    List<UserEntity> students = classroomService.obtainStudentsInClassroom(classroomId);

    if (students.isEmpty()) {
      return null;
    }

    List<UserEntity> studentsSortedByName = students.stream()
      .sorted(Comparator.comparing(UserEntity::getName, String.CASE_INSENSITIVE_ORDER))
      .toList();

    String[] columns = {"NOMBRE", "CORREO ELECTRÓNICO", "DNI", "COMISIÓN", "TIENE GRUPO"};

    try (Workbook workbook = new XSSFWorkbook();
         ByteArrayOutputStream out = new ByteArrayOutputStream()) {

      Sheet sheet = workbook.createSheet("Alumnos");
      sheet.setDisplayGridlines(true);

      byte[] azulOscuro = new byte[]{(byte) 31, (byte) 78, (byte) 121};
      byte[] grisClaro = new byte[]{(byte) 242, (byte) 242, (byte) 242};

      XSSFColor colorHeaderBg = new XSSFColor(azulOscuro, null);
      XSSFColor colorZebraBg = new XSSFColor(grisClaro, null);

      Font headerFont = workbook.createFont();
      headerFont.setFontName("Segoe UI");
      headerFont.setFontHeightInPoints((short) 11);
      headerFont.setBold(true);
      headerFont.setColor(IndexedColors.WHITE.getIndex());

      Font dataFont = workbook.createFont();
      dataFont.setFontName("Segoe UI");
      dataFont.setFontHeightInPoints((short) 10);

      CellStyle headerCellStyle = workbook.createCellStyle();
      headerCellStyle.setFont(headerFont);
      ((XSSFCellStyle) headerCellStyle).setFillForegroundColor(colorHeaderBg);
      headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
      headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
      setBordesDelgados(headerCellStyle);

      CellStyle dataStyleNormal = workbook.createCellStyle();
      dataStyleNormal.setFont(dataFont);
      dataStyleNormal.setVerticalAlignment(VerticalAlignment.CENTER);
      setBordesDelgados(dataStyleNormal);

      CellStyle dataStyleZebra = workbook.createCellStyle();
      dataStyleZebra.setFont(dataFont);
      ((XSSFCellStyle) dataStyleZebra).setFillForegroundColor(colorZebraBg);
      dataStyleZebra.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      dataStyleZebra.setVerticalAlignment(VerticalAlignment.CENTER);
      setBordesDelgados(dataStyleZebra);

      CellStyle dataStyleCenteredNormal = workbook.createCellStyle();
      dataStyleCenteredNormal.cloneStyleFrom(dataStyleNormal);
      dataStyleCenteredNormal.setAlignment(HorizontalAlignment.CENTER);

      CellStyle dataStyleCenteredZebra = workbook.createCellStyle();
      dataStyleCenteredZebra.cloneStyleFrom(dataStyleZebra);
      dataStyleCenteredZebra.setAlignment(HorizontalAlignment.CENTER);

      Row headerRow = sheet.createRow(0);
      headerRow.setHeightInPoints(24);

      for (int col = 0; col < columns.length; col++) {
        Cell cell = headerRow.createCell(col);
        cell.setCellValue(columns[col]);
        cell.setCellStyle(headerCellStyle);
      }

      int rowIdx = 1;
      for (UserEntity student : studentsSortedByName) {
        Row row = sheet.createRow(rowIdx++);
        row.setHeightInPoints(20);

        boolean esImpar = (rowIdx % 2 == 0);
        CellStyle estiloActual = esImpar ? dataStyleZebra : dataStyleNormal;
        CellStyle estiloCentradoActual = esImpar ? dataStyleCenteredZebra : dataStyleCenteredNormal;

        Cell cellName = row.createCell(0);
        cellName.setCellValue(student.getName());
        cellName.setCellStyle(estiloActual);

        Cell cellEmail = row.createCell(1);
        cellEmail.setCellValue(student.getEmail());
        cellEmail.setCellStyle(estiloActual);

        Cell cellDni = row.createCell(2);
        cellDni.setCellValue(student.getDni());
        cellDni.setCellStyle(estiloCentradoActual);

        Cell cellComission = row.createCell(3);
        String comisionesTexto = String.join(", ", student.getComission());
        cellComission.setCellValue(comisionesTexto);
        cellComission.setCellStyle(estiloActual);
        cellComission.setCellStyle(estiloCentradoActual);

        Cell cellGroup = row.createCell(4);
        cellGroup.setCellValue(student.getHasGroup() ? "SÍ" : "NO");
        cellGroup.setCellStyle(estiloCentradoActual);
      }

      for (int col = 0; col < columns.length; col++) {
        sheet.autoSizeColumn(col);
        int anchoActual = sheet.getColumnWidth(col);
        sheet.setColumnWidth(col, anchoActual + 1200);
      }

      workbook.write(out);
      return new ByteArrayInputStream(out.toByteArray());
    }
  }

  private void setBordesDelgados(CellStyle style) {
    style.setBorderTop(BorderStyle.THIN);
    style.setTopBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    style.setBorderBottom(BorderStyle.THIN);
    style.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    style.setBorderLeft(BorderStyle.THIN);
    style.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    style.setBorderRight(BorderStyle.THIN);
    style.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
  }
}
