export class ChangeResponse {
  public readonly responseBy: number|undefined;
  public readonly responseAt: Date;
  public readonly notes: string;

  constructor({
    responseBy,
    responseAt,
    notes
              }:{
    responseBy?: number;
    responseAt: Date;
    notes: string;
  }){
    if(!notes.trim())throw new Error("No such note");

    this.responseBy = responseBy;
    this.responseAt = responseAt;
    this.notes = notes;
  }

  toJson(){
    return {
      responseBy: this.responseBy,
      responseAt: this.responseAt,
      notes: this.notes
    }
  }
}
