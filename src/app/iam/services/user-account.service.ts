import { Injectable } from '@angular/core';
import { createDynamicService } from '../../shared/services/create-dynamic-service';
import { createEndpointConfig } from '../../shared/model/endpoint-config.vo';
import { HttpMethod } from '../../shared/model/http-method.vo';
import { UserAccount } from '../model/user-account.entity';
import { environment } from '../../../environments/environment';

const auth = `${environment.authenticationUser}:${environment.authenticationPassword}`;

@Injectable({
  providedIn: 'root'
})
export class UserAccountService {
  private readonly service = createDynamicService<UserAccount>([
    createEndpointConfig({ name: 'getAll', method: HttpMethod.GET }, undefined, 'user-accounts'),
    createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'user-accounts', '/:id'),
    createEndpointConfig({ name: 'create', method: HttpMethod.POST }, undefined, 'user-accounts'),
    createEndpointConfig({ name: 'update', method: HttpMethod.PUT }, undefined, 'user-accounts', '/:id'),
    createEndpointConfig({ name: 'delete', method: HttpMethod.DELETE }, undefined, 'user-accounts', '/:id')
  ]);

  getAll = this.service['getAll'];
  getById = this.service['getById'];
  create = this.service['create'];
  update = this.service['update'];
  delete = this.service['delete'];
}
