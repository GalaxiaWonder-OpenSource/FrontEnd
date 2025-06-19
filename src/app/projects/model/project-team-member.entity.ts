import {ProjectRole} from './project-role.vo';
import {Specialty} from './specialty.vo';

/**
 * Entity representing a member of a team project.
 */

export class ProjectTeamMember {

  public readonly id: number;

  public readonly firstName?: string;

  public readonly lastName?: string;

  public role: ProjectRole;

  public specialty: Specialty;

  public readonly memberId: number;

  public readonly personId: number;

  public readonly projectId: number;

  /**
   * Constructs a new ProjectTeamMember instance.
   *
   * @param id - Optional unique identifier (default: new UUID).
   * @param firstName - Project Team Member first firstName
   * @param lastName - Project Team Member last firstName
   * @param role - Role of the member in the project.
   * @param specialty - Specialty of the member in the project.
   * @param memberId - ID of the organization member.
   * @param personId - Optional ID of the person (default: new UUID).
   * @param projectId - Optional ID of the project (default: new UUID).
   */

  constructor({
                id = 0,
                firstName,
                lastName,
                role,
                specialty,
                memberId,
                personId,
                projectId
              }: {
    id?: number;
    firstName?: string;
    lastName?: string;
    role: ProjectRole;
    specialty: Specialty;
    memberId: number;
    personId: number;
    projectId: number;
  }) {
    if (!role || !specialty || !memberId) {
      throw new Error('Missing required fields in ProjectTeamMember.');
    }

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.specialty = specialty;
    this.memberId = memberId;
    this.personId = personId;
    this.projectId = projectId;
  }

  /**
   * Serializes the project team member to JSON.
   */
  toJSON(): object {
    return {
      id: this.id.toString(),
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      specialty: this.specialty,
      memberId: this.memberId.toString(),
      personId: this.personId.toString(),
      projectId: this.projectId.toString()
    };
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
