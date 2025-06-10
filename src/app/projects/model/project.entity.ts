import {ProjectTeamMember} from './project-team-member.entity';

export class Project {
  public readonly id: number | undefined;
  public name: string;
  public description: string;
  //public contract: Contract;
  //public technicalFile: TechnicalFile;
  //public status: ProjectStatus;
  //public schedule: Schedule;
  //public budget: Money;
  public readonly startingDate: Date;
  public readonly endingDate: Date;
  public readonly team: ProjectTeamMember[] = [];

  public readonly organizationId: number | undefined;
  public readonly contractor: number | undefined;
  public readonly contractingEntityId: number | undefined;
  //public readonly activeChangeProcessId: ChangeProcessId;

  /**
   * Constructs a new Project instance.
   *
   * @param projectId - Optional ID (default: new UUID).
   * @param name - Project name.
   * @param startingDate - Project starting date.
   * @param endingDate - Project ending date.
   * @param team - Optional existing team members.
   * @param organizationId - ID of the organization associated with the project.
   * @param contractor - ID of the contractor associated with the project.
   * @param contractingEntityId - ID of the contracting entity associated with the project.
   *
   */
  constructor({
                id,
                name,
                description,
                //contract,
                //technicalFile,
                //status,
                //schedule,
                //budget,
                startingDate = new Date(),
                endingDate = new Date(),
                team = [],
                organizationId,
                contractor,
                contractingEntityId,
                //activeChangeProcessId

              }: {
    id?: number;
    name: string;
    description: string;
    //contract: Contract;
    //technicalFile: TechnicalFile;
    //status: ProjectStatus;
    //schedule: Schedule;
    //budget: Money;
    startingDate: Date;
    endingDate: Date;
    team?: ProjectTeamMember[];
    organizationId: number;
    contractor: number;
    contractingEntityId: number;
    //activeChangeProcessId: ChangeProcessId;
  }) {
    if (!name
    || !startingDate || !endingDate) {
      throw new Error('Missing required fields in Project.');
    }

    this.id = id;
    this.name = name;
    this.description = description;
    //this.contract = contract;
    //this.technicalFile = technicalFile;
    //this.status = status;
    //this.schedule = schedule;
    //this.budget = budget;
    this.startingDate = startingDate;
    this.endingDate = endingDate;
    this.team = team;

    // Optional fields
    this.organizationId = organizationId;
    this.contractor = contractor;
    this.contractingEntityId = contractingEntityId;
    //this.activeChangeProcessId = activeChangeProcessId;
  }

  /**
   * Updates the name of the project.
   * @param name - New project name.
   */
  updateName(name: string): void {
    this.name = name;
  }

  /**
   * Updates the status of the project.
   * @param status - New project status.

  updateStatus(status: ProjectStatus): void {
    this.status = status;
  }
   */
  /**
   * Updates the description of the project.
   * @param description - New project description.
   */
  updateDescription(description: string): void {
    this.description = description;
  }

  /**
   * Adds a team member to the project.
   * @param member - Team member to add.
  */

  addTeamMember(member: ProjectTeamMember): void {
    this.team.push(member);
  }
  /**
   * Removes a team member from the project.
   * @param member - Team member to remove.

  removeTeamMember(memberId: ProjectTeamMemberId): void {
    const index = this.team.findIndex((m) => m.id === memberId);
    if (index !== -1) {
      this.team.splice(index, 1);
    }
  }
   */
  /**
   * Serializes the project to JSON.
   */
  toJSON(){
    return {
      projectId: this.id,
      name: this.name,
      description: this.description,
      //contract: this.contract.toJSON(),
      //technicalFile: this.technicalFile.toJSON(),
      //status: this.status,
      //schedule: this.schedule.toJSON(),
      //budget: this.budget.toJSON(),
      startingDate: this.startingDate.toISOString(),
      endingDate: this.endingDate.toISOString(),
      team: this.team.map((m) => m.toJSON()),
      organizationId: this.organizationId,
      contractor: this.contractor,
      contractingEntityId: this.contractingEntityId,
      //activeChangeProcessId: this.activeChangeProcessId.value
    };
  }
}
