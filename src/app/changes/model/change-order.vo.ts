import {MilestoneId} from '../../shared/model/milestone-id.vo';

export class ChangeOrder {
  public readonly issuedAt: Date;
  public readonly milestoneId: MilestoneId;
  public readonly description: string;

  constructor({
    issuedAt,
    milestoneId,
    description,
              }:{
    issuedAt: Date;
    milestoneId: MilestoneId;
    description: string;
  }) {
    if(!description.trim()) throw new Error("Description cannot be empty");

    this.issuedAt = issuedAt;
    this.milestoneId = milestoneId;
    this.description = description;
  }

  toJSON(){
    return {
      issuedAt: this.issuedAt,
      milestoneId: this.milestoneId.value,
      description: this.description
    }
  }
}
