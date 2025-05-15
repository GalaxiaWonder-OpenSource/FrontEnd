import {ChangeProcessId} from '../../shared/model/change-process-id.vo';
import {ChangeOrigin} from './change-origin.vo';
import {ChangeProcessStatus} from './change-process-status.vo';
import {ChangeOrder} from './change-order.vo';
import {ChangeResponse} from './change-response.vo';
import {ProjectId} from '../../shared/model/project-id.vo';

export class ChangeProcess {
  public readonly id: ChangeProcessId
  public readonly origin: ChangeOrigin;
  public readonly status: ChangeProcessStatus;
  public readonly justification: string;
  public readonly approvedAt?: Date;
  public readonly approvedBy?: Date;
  public readonly changeOrder?: ChangeOrder;
  public readonly response?: ChangeResponse;
  public readonly projectId: ProjectId;

  constructor({
    id = new ChangeProcessId,
    origin = ChangeOrigin.CHANGE_REQUEST,
    status = ChangeProcessStatus.APPROVED,
    justification,
    approvedAt,
    approvedBy,
    changeOrder,
    response,
    projectId,
              }:{
    id?: ChangeProcessId,
    origin?: ChangeOrigin,
    status: ChangeProcessStatus,
    justification: string,
    approvedAt?: Date,
    approvedBy: Date,
    changeOrder: ChangeOrder,
    response: ChangeResponse,
    projectId: ProjectId;
  }) {
    if(!justification.trim())throw new Error('Justification cannot be empty');

    this.id = id;
    this.origin = origin;
    this.status = status;
    this.justification = justification.trim();
    this.approvedAt = approvedAt;
    this.approvedBy = approvedBy;
    this.changeOrder = changeOrder;
    this.response = response;
    this.projectId = projectId;
  }

  toJSON() {
    return {
      id: this.id.value,
      origin: this.origin,
      status: this.status,
      justification: this.justification,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      changeOrder: this.changeOrder,
      response: this.response,
      projectId: this.projectId.value,
    }
  }
}
