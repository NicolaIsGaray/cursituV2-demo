import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, Location } from '@angular/common';
import { SubjectService } from '../../../services/subject.service';
import { Observable, of } from 'rxjs';
import { Subject } from '../../../models/subject.model';
import { QuillEditorComponent } from 'ngx-quill';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Topic } from '../../../models/topic.model';
import { TopicService } from '../../../services/topic.service';
import { Classroom } from '../../../models/classroom.model';
import { ClassroomService } from '../../../services/classroom.service';
import { Router } from '@angular/router';
import { Assignment } from '../../../models/assignment.model';
import { AssignmentService } from '../../../services/assignment.service';
import { TopicDTO } from '../../../models/dto/topicDTO';

@Component({
  selector: 'app-add-class',
  imports: [CommonModule, QuillEditorComponent, ReactiveFormsModule],
  templateUrl: './class-management.html',
  styleUrl: './class-management.css',
})
export class ClassManagement implements OnInit {
  mode: 'teorico' | 'entregable' = 'teorico';
  class_mode: string | null = null;
  assignmentFormat: 'archivo' | 'carpeta' | 'texto' = 'archivo';
  assignmentType: 'tarea' | 'parcial' = 'tarea';
  assignmentEnabled: 'habilitado' | 'deshabilitado' = 'habilitado';
  enableToDeliver: boolean = true;

  subject$!: Observable<Subject>;
  subjectId: string | null = null;

  currentClassroom: Classroom | null = null;
  classroom_id!: string;

  topicForm!: FormGroup;
  newTopic!: Topic;
  newTopicDTO!: TopicDTO;
  topicToEditId: string | null = null;

  assignmentForm!: FormGroup;
  newAssignment!: Assignment;

  editorModules = {
    toolbar: [
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'clean'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  constructor(
    public authService: AuthService,
    private subjectService: SubjectService,
    private topicService: TopicService,
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.checkClassMode();
    this.initForm();
    this.getSelectedSubjectAndClassroom();
  }

  initForm() {
    this.topicForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  initAssignmentForm() {
    this.assignmentForm = this.fb.group({
      assignmentTitle: ['', Validators.required],
      assignmentContent: [''],
      assignmentLimit: ['', Validators.required],
    });
  }

  checkClassMode() {
    this.class_mode = localStorage.getItem('class_mode');

    if (this.class_mode === 'editar') {
      this.topicToEditId = localStorage.getItem('cursitu_selected_topic');
      this.topicToEditId = this.topicToEditId!.replace(/"/g, '');

      if (this.topicToEditId) {
        this.topicService.getTopicById(this.topicToEditId).subscribe({
          next: (topic) => {
            if (!topic.assignmentId) {
              this.topicToEdit(topic, null);
            } else {
              this.assignmentService.getAssignmentInTopic(topic).subscribe({
                next: (assignment) => {
                  this.topicToEdit(topic, assignment);
                },
              });
            }
          },
          error: (err) => console.error('No se pudo obtener el tema a editar: ', err),
        });
      }
    }
  }

  getSelectedSubjectAndClassroom() {
    this.subjectId = this.subjectService.getItemFromStorage();
    if (!this.subjectId) {
      console.error('No se encontró el ID de la materia en el Storage.');
      return;
    }

    this.subject$ = this.subjectService.getSubjectById(this.subjectId);

    this.subject$.subscribe({
      next: (subjectData) => {
        document.documentElement.style.setProperty('--subject-color', subjectData.color);

        this.classroom_id = subjectData.classroom_id!;

        this.loadCurrentClassroom(this.classroom_id);
      },
      error: (err) => console.error('Error al obtener la materia: ', err),
    });
  }

  loadCurrentClassroom(classroom_id: string) {
    this.classroomService.getClassroomById(classroom_id).subscribe({
      next: (classroomData) => {
        this.currentClassroom = classroomData;
      },
      error: (err) => console.error('Error al obtener el aula virtual: ', err),
    });
  }

  onSubmit() {
    if (this.topicForm.invalid || !this.currentClassroom) return;

    const { title, content } = this.topicForm.value;

    this.newTopic = {
      title: title.trim(),
      content: content,
      classroom_id: this.classroom_id!,
    };

    if (this.mode === 'entregable') {
      if (this.assignmentForm.invalid) return;

      const { assignmentTitle, assignmentContent, assignmentLimit } = this.assignmentForm.value;

      this.newAssignment = {
        title: assignmentTitle.trim(),
        content: assignmentContent,
        date_limit: assignmentLimit,
        allowed_format: this.assignmentFormat,
        type: this.assignmentType,
        enabled_to_deliver: this.enableToDeliver,
        subject_id: this.subjectId!,
      };
    } else {
      this.newAssignment = null!;
    }

    this.submitTopic();
  }

  submitTopic() {
    if (this.class_mode === 'editar' && this.mode !== 'teorico') {  
      const { assignmentTitle, assignmentContent, assignmentLimit } = this.assignmentForm.value;

      this.newAssignment = {
        title: assignmentTitle.trim(),
        content: assignmentContent,
        date_limit: assignmentLimit,
        allowed_format: this.assignmentFormat,
        type: this.assignmentType,
        enabled_to_deliver: this.enableToDeliver,
        subject_id: this.subjectId!,
      };
    }

    const payload = {
      mode: this.mode,
      topic: this.newTopic,
      assignment: this.mode === 'entregable' ? this.newAssignment : null,
      classroom_id: this.classroom_id,
    };

    if (this.class_mode === 'crear') {
      this.topicService.submitTopic(payload).subscribe({
        next: () => {
          alert('Sección Creada Exitosamente.');
          this.navigateToClassroom();
        },
        error: (err) => console.error('Hubo un error en el flujo de creación: ', err),
      });
    } else if (this.class_mode === 'editar') {
      this.topicService.modifyTopic(this.topicToEditId!, payload).subscribe({
        next: () => {
          alert('Sección Modificada Exitosamente.');
          this.navigateToClassroom();
        },
        error: (err) => console.error('Hubo un error al intentar modificar la sección: ', err),
      });
    } else {
      console.error('Opción no válida.');
    }
  }

  topicToEdit(topic: Topic, assignment: Assignment | null) {
    this.topicForm.patchValue({
      title: topic.title,
      content: topic.content,
    });

    if (assignment) {
      this.initAssignmentForm();
      this.mode = 'entregable';
      this.assignmentForm.patchValue({
        assignmentTitle: assignment.title,
        assignmentContent: assignment.content,
        assignmentLimit: assignment.date_limit,
      });
    } else {
      this.mode = 'teorico';
    }
  }

  updateClassroomTopics(updatedClassroom: Classroom) {
    this.classroomService.modifyClassroom(updatedClassroom.id!, updatedClassroom).subscribe({
      next: () => {
        this.currentClassroom = updatedClassroom;
        alert('Sección Creada Exitosamente.');
        this.navigateToClassroom();
      },
      error: (err) => console.error('Hubo un error al asociar el tema al curso: ', err),
    });
  }

  switchMode(newMode: 'teorico' | 'entregable') {
    this.mode = newMode;

    if (this.mode === 'entregable') {
      this.initAssignmentForm();
    } else if (this.mode === 'teorico') {
      this.assignmentForm.reset();
    }
  }

  setFormat(newFormat: 'archivo' | 'carpeta' | 'texto') {
    this.assignmentFormat = newFormat;
  }

  setType(newType: 'tarea' | 'parcial') {
    this.assignmentType = newType;
  }

  setAvaiability(isAvaiable: 'habilitado' | 'deshabilitado') {
    this.assignmentEnabled = isAvaiable;

    if (this.assignmentEnabled === 'habilitado') {
      this.enableToDeliver = true;
    } else if (this.assignmentEnabled === 'deshabilitado') {
      this.enableToDeliver = false;
    }
  }

  navigateToClassroom() {
    this.router.navigate([`/current-classroom`, this.classroom_id]);
  }

  goBack() {
    this.location.back();
  }
}
