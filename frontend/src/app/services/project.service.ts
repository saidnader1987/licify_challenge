import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models/project';
import { ResponseHTTP } from '../interfaces/response';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getProject(projectId: string) {
    return this.http
      .get<ResponseHTTP<Project>>(this.apiUrl + `projects/${projectId}`)
      .pipe(
        map((res: ResponseHTTP<Project>) => {
          if (res.data) {
            res.data.startDate = new Date(res.data.startDate);
            res.data.endDate = new Date(res.data.endDate);
          }
          return res;
        })
      );
  }

  getAllProjectsFromUser(userId: string) {
    return this.http.get<ResponseHTTP<Project[]>>(
      this.apiUrl + `users/${userId}/projects`
    );
  }

  getAllProjects() {
    return this.http.get<ResponseHTTP<Project[]>>(this.apiUrl + 'projects/');
  }

  createProject(projectData: FormData) {
    return this.http.post<ResponseHTTP<Project>>(
      this.apiUrl + 'projects/',
      projectData
    );
  }
}
