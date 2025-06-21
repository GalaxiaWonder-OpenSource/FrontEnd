import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { ProjectTeamMember } from '../model/project-team-member.entity';

@Injectable({
  providedIn: 'root'
})
export class ProjectTeamMemberService {
  private readonly service = createDynamicService<ProjectTeamMember>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'project-team-members'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'project-team-members', '/:id'),
    createEndpointConfig({ name: 'getByProjectId', method: HttpMethod.GET }, undefined, 'project-team-members'),
    createEndpointConfig({ name: 'getByPersonId', method: HttpMethod.GET }, undefined, 'projects/by-person-id', '/:personId'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'project-team-members'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'project-team-members', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'project-team-members', '/:id')
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  getByProjectId = this.service['getByProjectId'];
  getByPersonId = this.service['getByPersonId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
}
