import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { Milestone } from '../model/milestone.entity';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private readonly service = createDynamicService<Milestone>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'milestones'),
    createEndpointConfig({ name: 'getByProjectId', method: HttpMethod.GET }, undefined, 'milestones'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'milestones'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'milestones', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'milestones', '/:id'),
  ]);

  getAll = this.service['getAll'];
  getByProjectId = this.service['getByProjectId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];

}
