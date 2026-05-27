import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Aviso } from '../../../notices/temp.model.notices';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NoticeService } from '../../../services/notice.service';
import { Notice } from '../../../models/notice.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-notice-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './notice-details.html',
  styleUrl: '../notices.css',
})
export class NoticeDetails implements OnInit {
  currentNotice$!: Observable<Notice>;

  autor$!: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private actRoute: ActivatedRoute,
    private noticeService: NoticeService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadNotice();
  }

  loadNotice() {
    const id = this.actRoute.snapshot.paramMap.get('id');

    this.currentNotice$ = this.noticeService.getNoticeById(id!).pipe(
      tap((notice: Notice) => {
        this.loadAutorInfo(notice.senderId);
      })
    );
  }

  loadAutorInfo(id: string) {
    this.autor$ = this.userService.getUserById(id);
  }

  formatDate(original: Date | string): string {
    if (!original) return 'SIN FECHA';
    const date = new Date(original);
    const formatter = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let formattedDate = formatter.format(date);
    formattedDate = formattedDate.replace(/,/g, '');
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    formattedDate = formattedDate.replace(
      /(\bde\s)(\w)/g,
      (match, p1, p2) => p1 + p2.toUpperCase(),
    );
    return formattedDate.replace(/\./g, '');
  }

  goBack() {
    this.location.back();
  }
}
