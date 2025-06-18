import { OrganizationMemberType } from './organization-member-type.vo';

/**
 * Entity representing a member of an organization.
 */
export class OrganizationMember {
  /** Unique identifier of the membership. */
  public readonly id: number|undefined;

  /** ID of the associated person. */
  public readonly personId: number|undefined;

  /** Optional personal info used for display (retrieved from person or enriched API). */
  public readonly firstName?: string;
  public readonly lastName?: string;
  public readonly email?: string;

  /** ID of the organization to which the person belongs. */
  public readonly organizationId: number|undefined;

  /** Role/type of the member within the organization. */
  public memberType: OrganizationMemberType;

  /** Date when the person joined the organization. */
  public readonly joinedAt: Date;

  /**
   * Constructs a new OrganizationMember instance.
   *
   * @param id - Optional unique identifier (default: new UUID).
   * @param firstName - First name of the organization member.
   * @param lastName - Last name of the organization member.
   * @param email - Email addres of the organization member.
   * @param personId - ID of the person entity associated with the organization member.
   * @param organizationId - ID of the organization.
   * @param memberType - Type of membership.
   * @param joinedAt - Optional joined date (default: now).
   */
  constructor({
                id,
                firstName,
                lastName,
                email,
                personId,
                organizationId,
                memberType,
                joinedAt = new Date()
              }: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    personId?: number;
    organizationId?: number;
    memberType: OrganizationMemberType;
    joinedAt?: Date;
  }) {
    if (!personId || !organizationId || !memberType) {
      throw new Error('Missing required fields in OrganizationMember.');
    }

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
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
      name: this.firstName,
      lastName: this.lastName,
      email: this.email,
      personId: this.personId,
      organizationId: this.organizationId,
      memberType: this.memberType,
      joinedAt: this.joinedAt.toISOString()
    };
  }
}
