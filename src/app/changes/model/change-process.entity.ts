import {ChangeOrigin} from './change-origin.vo';
import {ChangeProcessStatus} from './change-process-status.vo';
import {ChangeOrder} from './change-order.vo';
import {ChangeResponse} from './change-response.vo';

export class ChangeProcess {
<<<<<<< Updated upstream
  public readonly id: number | undefined;
=======
  public readonly id: number|undefined
>>>>>>> Stashed changes
  public readonly origin: ChangeOrigin;
  public readonly status: ChangeProcessStatus;
  public readonly justification: string;
  public readonly description: string;
  public readonly approvedAt?: Date;
  public readonly approvedBy?: Date;
  public readonly changeOrder?: ChangeOrder;
  public readonly response?: ChangeResponse;
<<<<<<< Updated upstream
  public readonly projectId: number | undefined;
=======
  public readonly projectId: number|undefined;
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    origin: ChangeOrigin,
=======
    origin?: ChangeOrigin,
>>>>>>> Stashed changes
    status: ChangeProcessStatus,
    justification: string,
    description: string,
    approvedAt?: Date,
<<<<<<< Updated upstream
    approvedBy?: Date,
    changeOrder?: ChangeOrder,
    response?: ChangeResponse,
=======
    approvedBy: Date,
    changeOrder: ChangeOrder,
    response: ChangeResponse,
>>>>>>> Stashed changes
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
