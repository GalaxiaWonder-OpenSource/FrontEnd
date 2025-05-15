import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { OrganizationMember } from '../model/organization-member.entity';

@Injectable({
  providedIn: 'root'
})
export class OrganizationMemberService {
  private readonly service = createDynamicService<OrganizationMember>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'organization-members'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'organization-members', '/:id'),
    createEndpointConfig({ name: 'getByOrganizationId', method: HttpMethod.GET }, undefined, 'organization-members'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'organization-members'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'organization-members', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'organization-members', '/:id')
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  getByOrganizationId = this.service['getByOrganizationId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
}
