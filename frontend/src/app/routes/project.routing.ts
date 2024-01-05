import { Route } from '@angular/router';
import { ProjectListComponent } from '../components/project/project-list/project-list.component';
import { ProjectCreateComponent } from '../components/project/project-create/project-create.component';
import { ProjectDetailComponent } from '../components/project/project-detail/project-detail.component';

export const PROJECT_ROUTES: Route[] = [
  { path: '', component: ProjectListComponent },
  { path: 'crear', component: ProjectCreateComponent },
  { path: ':projectId', component: ProjectDetailComponent },
];
