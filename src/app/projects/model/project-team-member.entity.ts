import {OrganizationMemberId} from '../../shared/model/organization-member-id.vo';
import {ProjectTeamMemberId} from '../../shared/model/project-team-member-id.vo';
import {ProjectRole} from './project-role.vo';
import {Specialty} from './specialty.vo';
import {PersonId} from '../../shared/model/person-id.vo';
import {ProjectId} from '../../shared/model/project-id.vo';

/**
 * Entity representing a member of a team project.
 */

export class ProjectTeamMember {

  public readonly id: ProjectTeamMemberId;


  public role: ProjectRole;

  public specialty: Specialty;

  public readonly memberId: OrganizationMemberId;

  public readonly personId: PersonId;

  public readonly projectId: ProjectId;

  /**
   * Constructs a new ProjectTeamMember instance.
   *
   * @param id - Optional unique identifier (default: new UUID).
   * @param role - Role of the member in the project.
   * @param specialty - Specialty of the member in the project.
   * @param memberId - ID of the organization member.
   * @param personId - Optional ID of the person (default: new UUID).
   * @param projectId - Optional ID of the project (default: new UUID).
   */

  constructor({
                id = new ProjectTeamMemberId(),
                role,
                specialty,
                memberId,
                personId = new PersonId(),
                projectId = new ProjectId()
              }: {
    id?: ProjectTeamMemberId;
    role: ProjectRole;
    specialty: Specialty;
    memberId: OrganizationMemberId;
    personId?: PersonId;
    projectId?: ProjectId;
  }) {
    if (!role || !specialty || !memberId) {
      throw new Error('Missing required fields in ProjectTeamMember.');
    }

    this.id = id;
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
      role: this.role,
      specialty: this.specialty,
      memberId: this.memberId.toString(),
      personId: this.personId.toString(),
      projectId: this.projectId.toString()
    };
  }
}
