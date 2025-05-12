import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { Person } from '../model/person.entity';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly service = createDynamicService<Person>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'persons'),
    createEndpointConfig({ name: 'getByEmail', method: HttpMethod.GET }, undefined, 'persons'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'persons'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'persons', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'persons', '/:id')
  ]);

  getAll = this.service['getAll'];
  getByEmail = this.service['getByEmail'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
}
