import {ProjectTeamMember} from './project-team-member.entity';
import {ProjectStatus} from './project-status.vo';
import {ProjectRole} from './project-role.vo';
import {Person} from '../../iam/model/person.entity';


export class Project {
  public readonly id: number;
  public name: string;
  public description: string;
  public status: ProjectStatus;
  public readonly startingDate: Date;
  public readonly endingDate: Date;
  public readonly team: ProjectTeamMember[] = [];

  public readonly organizationId: number;
  public readonly contractingEntity: Person|undefined;
  public readonly activeChangeProcessId: number|undefined;

  // Required because of front end design
  public readonly currentUserRoleOnProject: ProjectRole;

  /**
   * Constructs a new Project instance.
   *
   * @param projectId - Optional ID (default: new UUID).
   * @param name - Project name.
   * @param startingDate - Project starting date.
   * @param endingDate - Project ending date.
   * @param status - Optional project status (default: BASIC_STUDIES).
   * @param team - Optional existing team members.
   * @param organizationId - ID of the organization associated with the project.
   * @param contractingEntity - ID of the contracting entity associated with the project.
   *
   */
  constructor({
                id = 0,
                name,
                description,
                status,
                startingDate = new Date(),
                endingDate = new Date(),
                team = [],
                organizationId,
                contractingEntity,
                activeChangeProcessId,
                currentUserRoleOnProject
              }: {
    id?: number;
    name: string;
    description: string;
    status: ProjectStatus;
    startingDate: Date;
    endingDate: Date;
    team?: ProjectTeamMember[];
    organizationId: number;
    contractingEntity: Person|undefined;
    activeChangeProcessId?: number;
    currentUserRoleOnProject: ProjectRole;
  }) {
    if (!name
    || !startingDate || !endingDate) {
      throw new Error('Missing required fields in Project.');
    }

    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.startingDate = startingDate;
    this.endingDate = endingDate;
    this.team = team;

    // Optional fields
    this.organizationId = organizationId;
    this.contractingEntity = contractingEntity;
    this.activeChangeProcessId = activeChangeProcessId;
    this.currentUserRoleOnProject = currentUserRoleOnProject;
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
  */
  updateStatus(status: ProjectStatus): void {
    this.status = status;
  }

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
      status: this.status,
      startingDate: this.startingDate.toISOString(),
      endingDate: this.endingDate.toISOString(),
      team: this.team.map((m) => m.toJSON()),
      organizationId: this.organizationId,
      contractingEntity: this.contractingEntity?.firstName,
      activeChangeProcessId: this.activeChangeProcessId
    };
  }
}
