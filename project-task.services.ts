import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ProjectTaskPagingRequestModel, TaskModule } from './model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) { }


  getAll = (request: ProjectTaskPagingRequestModel) =>
    this.http.post(`${environment.baseWebApiUrl}/v1/ProjectTask/taskbyprojectid`, request).pipe(
      map((response: any) => {
        return response;
      }));

  createOrUpdate = (request: TaskModule) =>
    this.http.post(`${environment.baseWebApiUrl}/v1/ProjectTask`, request).pipe(
      map((response: any) => {
        return response;
      })
    );

  DeleteTaskById = (projectId: number) =>
    this.http.delete(`${environment.baseWebApiUrl}/v1/ProjectTask/${projectId}`).pipe(
      map((response: any) => {
        return response;
      }));

  getTaskCalcCount = () =>
    this.http.get(`${environment.baseWebApiUrl}/v1/ProjectTask/gettaskcalculatedcount`).pipe(
      map((response: any) => {
        return response;
      }));
}