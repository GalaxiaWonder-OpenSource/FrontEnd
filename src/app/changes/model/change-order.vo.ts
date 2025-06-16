export class ChangeOrder {
  public readonly issuedAt: Date;
  public readonly milestoneId: number;
  public readonly description: string;

  constructor({
    issuedAt,
    milestoneId,
    description,
              }:{
    issuedAt: Date;
    milestoneId: number;
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
      milestoneId: this.milestoneId,
      description: this.description
    }
  }
}
