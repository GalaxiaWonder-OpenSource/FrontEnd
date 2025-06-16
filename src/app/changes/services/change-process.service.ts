import { Injectable } from '@angular/core';
import {createDynamicService} from '../../shared/services/create-dynamic-service';
import {ChangeProcess} from '../model/change-process.entity';
import {createEndpointConfig} from '../../shared/model/endpoint-config.vo';
import {HttpMethod} from '../../shared/model/http-method.vo';

@Injectable({
  providedIn: 'root'
})
export class ChangeProcessService {
  private readonly service = createDynamicService<ChangeProcess>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'changeProcess'),
    createEndpointConfig({ name: 'getByProject', method: HttpMethod.GET }, undefined, 'changeProcess'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'changeProcess'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'changeProcess', '/:id'),
  ]);
  getAll = this.service['getAll'];
  getByProject = this.service['getByProject'];
  create = this.service['create'];
  update = this.service['update'];
}
