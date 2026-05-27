import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { AuthService } from '../../../services/auth.service';
import { CommonModule, Location } from '@angular/common';
import { Subject } from '../../../models/subject.model';
import { SubjectService } from '../../../services/subject.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-professor-panel',
  imports: [RouterModule, CommonModule],
  templateUrl: './professor-panel.html',
  styleUrl: './professor-panel.css',
})
export class ProfessorPanel implements OnInit{
  subject$!: Observable<Subject>;
  subjectId: string | null = null;

  constructor(
    private route: Router,
    public authService: AuthService,
    private subjectService: SubjectService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getSelectedSubject();
  }

  getSelectedSubject() {
    this.subjectId = this.subjectService.getItemFromStorage();

    if (this.subjectId) {
      this.subject$ = this.subjectService.getSubjectById(this.subjectId);
    }
  }

  navigateToClassroom(path: string, classroomId: string) {
    this.route.navigate([path, classroomId])
  }

  goBack() {
    this.location.back();
  }
}
