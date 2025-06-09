import { PersonId } from '../../shared/model/person-id.vo';
import { OrganizationId } from '../../shared/model/organization-id.vo';
import { OrganizationMemberType } from './organization-member-type.vo';

/**
 * Entity representing a member of an organization.
 */
export class OrganizationMember {
  /** Unique identifier of the membership. */
  public readonly id: number;

  /** ID of the associated person. */
  public readonly personId: PersonId;

  /** ID of the organization to which the person belongs. */
  public readonly organizationId: OrganizationId;

  /** Role/type of the member within the organization. */
  public memberType: OrganizationMemberType;

  /** Date when the person joined the organization. */
  public readonly joinedAt: Date;

  /**
   * Constructs a new OrganizationMember instance.
   *
   * @param id - Optional unique identifier (default: new UUID).
   * @param personId - ID of the person.
   * @param organizationId - ID of the organization.
   * @param memberType - Type of membership.
   * @param joinedAt - Optional joined date (default: now).
   */
  constructor({
                id,
                personId,
                organizationId,
                memberType,
                joinedAt = new Date()
              }: {
    id?: number;
    personId: PersonId;
    organizationId: OrganizationId;
    memberType: OrganizationMemberType;
    joinedAt?: Date;
  }) {
    if (!personId || !organizationId || !memberType) {
      throw new Error('Missing required fields in OrganizationMember.');
    }

    this.id = 0;
    this.personId = personId;
    this.organizationId = organizationId;
    this.memberType = memberType;
    this.joinedAt = joinedAt;
  }

  /**
   * Serializes the organization member to JSON.
   */
  toJSON() {
    return {
      id: this.id,
      personId: this.personId.value,
      organizationId: this.organizationId.value,
      memberType: this.memberType,
      joinedAt: this.joinedAt.toISOString()
    };
  }
}
