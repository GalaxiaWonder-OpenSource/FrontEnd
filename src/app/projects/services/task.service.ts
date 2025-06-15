import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Task } from '../model/task.entity';
import { TaskId } from '../../shared/model/task-id.vo';
import { MilestoneId } from '../../shared/model/milestone-id.vo';
import { Specialty } from '../model/specialty.vo';
import { TaskStatus } from '../model/task-status.vo';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasksByMilestoneId(milestoneId: string | MilestoneId): Observable<Task[]> {
    const id = milestoneId instanceof MilestoneId ? milestoneId.value : milestoneId;
    const url = `${environment.propgmsApiBaseUrl}/tasks?milestoneId=${id}`;
    
    return this.http.get<any[]>(url).pipe(
      map(tasks => tasks.map((task: any) => new Task({
        id: task.id,
        name: task.name,
        specialty: task.specialty,
        startingDate: task.startingDate,
        dueDate: task.dueDate,
        milestoneId: task.milestoneId,
        status: task.status,
        description: task.description,
        responsibleId: task.responsibleId
      }))),
      catchError(this.handleError)
    );
  }

  createTask(task: Task): Observable<Task> {
    // Prepare the data for transmission
    const taskData = {
      id: task.id.toString(),
      name: task.name,
      specialty: task.specialty,
      startingDate: task.startingDate.toISOString(),
      dueDate: task.dueDate.toISOString(),
      milestoneId: task.milestoneId.toString(),
      status: task.status,
      description: task.description || '',
      responsibleId: task.responsibleId
    };
    
    return this.http.post<any>(`${environment.propgmsApiBaseUrl}/tasks`, taskData).pipe(
      map((response: any) => new Task({
        id: response.id,
        name: response.name,
        specialty: response.specialty,
        startingDate: response.startingDate,
        dueDate: response.dueDate,
        milestoneId: response.milestoneId,
        status: response.status,
        description: response.description,
        responsibleId: response.responsibleId
      })),
      catchError(this.handleError)
    );
  }

  updateTask(task: Task): Observable<Task> {
    const taskId = task.id.toString();
    
    // Prepare the data for transmission
    const taskData = {
      id: taskId,
      name: task.name,
      specialty: task.specialty,
      startingDate: task.startingDate.toISOString(),
      dueDate: task.dueDate.toISOString(),
      milestoneId: task.milestoneId.toString(),
      status: task.status,
      description: task.description || '',
      responsibleId: task.responsibleId
    };
    
    return this.http.put<any>(`${environment.propgmsApiBaseUrl}/tasks/${taskId}`, taskData).pipe(
      map((response: any) => new Task({
        id: response.id,
        name: response.name,
        specialty: response.specialty,
        startingDate: response.startingDate,
        dueDate: response.dueDate,
        milestoneId: response.milestoneId,
        status: response.status,
        description: response.description,
        responsibleId: response.responsibleId
      })),
      catchError(this.handleError)
    );
  }

  deleteTask(taskId: string | number | TaskId): Observable<void> {
    const id = taskId instanceof TaskId ? taskId.value : taskId;
    return this.http.delete<void>(`${environment.propgmsApiBaseUrl}/tasks/${id}`).pipe(
      map(() => undefined), // Ensure we return void even if the server returns something
      catchError((error: HttpErrorResponse) => {
        // If it's a 500 error but likely deleted successfully
        if (error.status === 500) {
          console.warn('Server returned 500 on delete, but the task was likely deleted');
          return throwError(() => new Error('Task deleted, but server returned an error'));
        }
        // For other errors, use standard error handler
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
