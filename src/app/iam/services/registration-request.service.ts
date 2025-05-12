import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { RegistrationRequest } from '../model/registration-request.entity';

@Injectable({
  providedIn: 'root'
})
export class RegistrationRequestService {
  private readonly service = createDynamicService<RegistrationRequest>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'registrationRequests'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'registrationRequests', '/:id'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'registrationRequests'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'registrationRequests', '/:id')
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  create = this.service['create'];
  delete = this.service['delete'];
}
