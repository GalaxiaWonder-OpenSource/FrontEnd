import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { Organization } from '../model/organization.entity';
import { Observable, map } from 'rxjs';

const TOKEN = localStorage.getItem('token') || undefined;

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly service = createDynamicService<Organization>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'organizations'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'organizations', '/:id'),
    createEndpointConfig({ name: 'getByContractorId', method: HttpMethod.GET }, undefined, 'organizations'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST },undefined, '/organizations', '', TOKEN),
    createEndpointConfig({ name: 'getByPersonId', method: HttpMethod.GET }, 'http://localhost:8080/api/v1', 'organizations/by-person-id', '/:id'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PATCH }, undefined, 'organizations', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'organizations', '/:id'),
    createEndpointConfig({ name: 'deactivate', method: HttpMethod.PATCH }, undefined, 'organizations', '/:id/deactivate'),
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  getByContractorId = this.service['getByContractorId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
  deactivate = this.service['deactivate'];
  getByPersonId = this.service['getByPersonId']
  /**
   * Verifica si un usuario es el creador de una organización
   * @param organizationId ID de la organización
   * @param personId ID de la persona a verificar
   * @returns Observable<boolean> true si la persona es creadora
   */
  isOrganizationCreator(organizationId: number, personId: number): Observable<boolean> {
    return this.getById({}, { id: organizationId.toString() }).pipe(
      map((organization: any) => {
        return organization && organization.createdBy === personId;
      })
    );
  }
}
