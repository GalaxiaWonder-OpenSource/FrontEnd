import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { Organization } from '../model/organization.entity';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly service = createDynamicService<Organization>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'organizations'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'organizations', '/:id'),
    createEndpointConfig({ name: 'getByContractorId', method: HttpMethod.GET }, undefined, 'organizations'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'organizations'),
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
}
