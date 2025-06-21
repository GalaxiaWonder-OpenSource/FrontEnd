import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { Project } from '../model/project.entity';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly service = createDynamicService<Project>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'projects'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'projects', '/:id'),
    createEndpointConfig({ name: 'getByClientId', method: HttpMethod.GET }, undefined, 'projects', '?clientId=:clientId'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'projects'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'projects', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'projects', '/:id'),
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  getByClientId = this.service['getByClientId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
}
