import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { OrganizationInvitation } from '../model/organization-invitation.entity';

@Injectable({
  providedIn: 'root'
})
export class OrganizationInvitationService {
  private readonly service = createDynamicService<OrganizationInvitation>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'organization-invitations'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'organization-invitations', '/:id'),
    createEndpointConfig({ name: 'getByPersonId', method: HttpMethod.GET }, undefined, 'organization-invitations'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'organization-invitations'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PATCH }, undefined, 'organization-invitations', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'organization-invitations', '/:id'),
    createEndpointConfig({ name: 'accept', method: HttpMethod.PATCH }, undefined, 'organization-invitations', '/:id/accept'),
    createEndpointConfig({ name: 'reject', method: HttpMethod.PATCH }, undefined, 'organization-invitations', '/:id/reject')
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  getByPersonId = this.service['getByPersonId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
  accept = this.service['accept'];
  reject = this.service['reject'];
}
