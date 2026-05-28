import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/auth/login/login';
import { NotFound } from './components/not-found/not-found';
import { Groups } from './components/groups/groups';
import { SubjectsList } from './components/subject-list/subjects-list';
import { CurrentClassroom } from './components/classroom/current-classroom/current-classroom';
import { PendingTasks } from './components/classroom/pending-tasks/pending-tasks';
import { NoticesList } from './components/notices/notices-list/notices-list';
import { SendTask } from './components/classroom/send-task/send-task';
import { NoticeDetails } from './components/notices/notice-details/notice-details';
import { TransmissionLobby } from './components/transmissions/transmission-lobby/transmission-lobby';
import { TransmissionLive } from './components/transmissions/transmission-live/transmission-live';
import { ProfessorPanel } from './components/professor-only/professor-panel/professor-panel';
import { ManageGrades } from './components/professor-only/manage-grades/manage-grades';
import { ClassManagement } from './components/professor-only/class-management/class-management';
import { EditSubject } from './components/professor-only/edit-subject/edit-subject';
import { ManageDates } from './components/professor-only/manage-dates/manage-dates';
import { SeeDeliveries } from './components/professor-only/see-deliveries/see-deliveries';
import { ManageFinals } from './components/professor-only/manage-finals/manage-finals';
import { StudentsList } from './components/students-list/students-list';
import { MyNotices } from './components/professor-only/my-notices/my-notices';
import { PageConfiguration } from './components/page-configuration/page-configuration';
import { UserManagement } from './components/admin/user-management/user-management';
import { SubjectManagement } from './components/admin/subject-management/subject-management';
import { AnnouncementPanel } from './components/admin/announcement-panel/announcement-panel';
import { ManageAssignments } from './components/professor-only/manage-assignments/manage-assignments';
import { AssignmentPreview } from './components/professor-only/assignment-preview/assignment-preview';
import { TeacherRegister } from './components/auth/teacher-register/teacher-register';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
    // RUTAS PÚBLICAS
    { path: 'login', component: Login },
    { path: 'register-professor', component: TeacherRegister },

    // RUTAS PRIVADAS
    { path: '', component: Home, pathMatch: 'full', canActivate: [authGuard] },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'subjects', component: SubjectsList, canActivate: [authGuard] },
    { path: 'groups', component: Groups, canActivate: [authGuard] },
    { path: 'transmission-lobby', component: TransmissionLobby, canActivate: [authGuard] },
    { path: 'transmission-live', component: TransmissionLive, canActivate: [authGuard] },

    { path: 'user-management', component: UserManagement, canActivate: [authGuard] },
    { path: 'subject-management', component: SubjectManagement, canActivate: [authGuard] },
    { path: 'announcement-panel', component: AnnouncementPanel, canActivate: [authGuard] },

    { path: 'professor-panel', component: ProfessorPanel, canActivate: [authGuard] },
    { path: 'manage-grades', component: ManageGrades, canActivate: [authGuard] },
    { path: 'class-management', component: ClassManagement, canActivate: [authGuard] },
    { path: 'edit-subject', component: EditSubject, canActivate: [authGuard] },
    { path: 'manage-dates', component: ManageDates, canActivate: [authGuard] },
    { path: 'manage-tasks', component: ManageAssignments, canActivate: [authGuard] },
    { path: 'see-assignment/:id', component: AssignmentPreview, canActivate: [authGuard] },
    { path: 'see-deliveries', component: SeeDeliveries, canActivate: [authGuard] },
    { path: 'manage-finals', component: ManageFinals, canActivate: [authGuard] },
    { path: 'students', component: StudentsList, canActivate: [authGuard] },
    { path: 'my-notices', component: MyNotices, canActivate: [authGuard] },

    { path: 'current-classroom/:id', component: CurrentClassroom, canActivate: [authGuard] },
    { path: 'pending-tasks', component: PendingTasks, canActivate: [authGuard] },
    { path: 'send-task/:id', component: SendTask, canActivate: [authGuard] },
    { path: 'notices', component: NoticesList, canActivate: [authGuard] },
    { path: 'notices/:id', component: NoticeDetails, canActivate: [authGuard] },
    { path: 'configuration', component: PageConfiguration, canActivate: [authGuard] },
    
    { path: '**', component: NotFound, canActivate: [authGuard] }
];