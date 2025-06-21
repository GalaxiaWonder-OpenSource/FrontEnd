import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { Task } from '../model/task.entity';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly service = createDynamicService<Task>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'tasks'),
    createEndpointConfig({ name: 'getByMilestoneId', method: HttpMethod.GET }, undefined, 'tasks'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'tasks'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'tasks', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'tasks', '/:id'),
  ]);

  getAll = this.service['getAll'];
  getByMilestoneId = this.service['getByMilestoneId'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
}
