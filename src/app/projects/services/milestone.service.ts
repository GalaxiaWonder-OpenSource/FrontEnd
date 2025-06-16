import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Milestone } from '../model/milestone.entity';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  constructor(private http: HttpClient) {}

  getMilestonesByProjectId(projectId: string | number): Observable<Milestone[]> {
    const url = `${environment.propgmsApiBaseUrl}/milestones?projectId=${projectId}`;
    
    return this.http.get<any[]>(url).pipe(
      map(milestones => milestones.map((milestone: any) => new Milestone({
        id: milestone.id,
        name: milestone.name,
        startingDate: milestone.startingDate,
        endingDate: milestone.endingDate,
        projectId: milestone.projectId,
        description: milestone.description
      }))),
      catchError(this.handleError)
    );
  }

  createMilestone(milestone: Milestone): Observable<Milestone> {
    // Prepare the data for transmission
    const milestoneData = {
      id: milestone.id,
      name: milestone.name,
      startingDate: milestone.startingDate.toISOString(),
      endingDate: milestone.endingDate.toISOString(),
      projectId: milestone.projectId,
      description: milestone.description || ''
    };

    return this.http.post<any>(`${environment.propgmsApiBaseUrl}/milestones`, milestoneData).pipe(
      map((response: any) => new Milestone({
        id: response.id,
        name: response.name,
        startingDate: response.startingDate,
        endingDate: response.endingDate,
        projectId: response.projectId,
        description: response.description
      })),
      catchError(this.handleError)
    );
  }

  updateMilestone(milestone: Milestone): Observable<Milestone> {
    const milestoneId = milestone.id;
    
    // Prepare the data for transmission
    const milestoneData = {
      id: milestoneId,
      name: milestone.name,
      startingDate: milestone.startingDate.toISOString(),
      endingDate: milestone.endingDate.toISOString(),
      projectId: milestone.projectId,
      description: milestone.description || ''
    };

    return this.http.put<any>(`${environment.propgmsApiBaseUrl}/milestones/${milestoneId}`, milestoneData).pipe(
      map((response: any) => new Milestone({
        id: response.id,
        name: response.name,
        startingDate: response.startingDate,
        endingDate: response.endingDate,
        projectId: response.projectId,
        description: response.description
      })),
      catchError(this.handleError)
    );
  }

  deleteMilestone(milestoneId: string | number): Observable<void> {
    return this.http.delete<void>(`${environment.propgmsApiBaseUrl}/milestones/${milestoneId}`).pipe(
      map(() => undefined), // Asegurarse de que siempre devuelve void
      catchError((error: HttpErrorResponse) => {
        // Si es un error 500 pero probablemente se eliminó correctamente
        if (error.status === 500) {
          console.warn('Server returned 500 on delete, but the milestone was likely deleted');
          return of(undefined); // Continuar como si la operación fuera exitosa
        }
        // Para otros errores, usar el manejador de errores estándar
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
