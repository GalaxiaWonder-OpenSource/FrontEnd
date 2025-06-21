import {ChangeOrigin} from './change-origin.vo';
import {ChangeProcessStatus} from './change-process-status.vo';
import {ChangeOrder} from './change-order.vo';
import {ChangeResponse} from './change-response.vo';

export class ChangeProcess {
  public readonly id?: number | undefined;
  public readonly origin: ChangeOrigin;
  public readonly status: ChangeProcessStatus;
  public readonly justification: string;
  public readonly description: string;
  public readonly approvedAt?: Date;
  public readonly approvedBy?: Date;
  public readonly changeOrder?: ChangeOrder;
  public readonly response?: ChangeResponse;
  public readonly projectId: number | undefined;

  constructor({
    id,
    origin = ChangeOrigin.CHANGE_REQUEST,
    status = ChangeProcessStatus.APPROVED,
    justification,
    description,
    approvedAt,
    approvedBy,
    changeOrder,
    response,
    projectId,
              }:{
    id?: number,
    origin: ChangeOrigin,
    status: ChangeProcessStatus,
    justification: string,
    description: string,
    approvedAt?: Date,
    approvedBy?: Date,
    changeOrder?: ChangeOrder,
    response?: ChangeResponse,
    projectId: number;
  }) {
    if(!justification.trim())throw new Error('Justification cannot be empty');

    this.id = id;
    this.origin = origin;
    this.status = status;
    this.justification = justification.trim();
    this.description = description;
    this.approvedAt = approvedAt;
    this.approvedBy = approvedBy;
    this.changeOrder = changeOrder;
    this.response = response;
    this.projectId = projectId;
  }

  toJSON() {
    return {
      id: this.id,
      origin: this.origin,
      status: this.status,
      justification: this.justification,
      description: this.description,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      changeOrder: this.changeOrder,
      response: this.response,
      projectId: this.projectId,
    }
  }
}
