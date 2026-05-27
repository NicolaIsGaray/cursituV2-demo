import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AssignmentService } from '../../../services/assignment.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-assignment-preview',
  imports: [CommonModule],
  templateUrl: './assignment-preview.html',
  styleUrl: './assignment-preview.css',
})
export class AssignmentPreview implements OnInit {
  assignment$!: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const activityId = this.route.snapshot.paramMap.get('id');
    if (activityId) {
      this.assignment$ = this.assignmentService.getAssignmentById(activityId);
    }
  }

  formatDate(original: Date | string): string {
    if (!original) return 'SIN FECHA LÍMITE';
    const date = new Date(original);
    const formatter = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    let formatted = formatter.format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  goBack(): void {
    this.location.back();
  }
}
