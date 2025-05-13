import { OrganizationInvitationId } from '../../shared/model/organization-invitation-id.vo';
import { OrganizationId } from '../../shared/model/organization-id.vo';
import { PersonId } from '../../shared/model/person-id.vo';
import { InvitationStatus } from './invitation-status.vo';

/**
 * Entity representing an invitation to join an organization.
 */
export class OrganizationInvitation {
  public readonly invitationId: OrganizationInvitationId;
  public readonly organizationId: OrganizationId;
  public readonly personId: PersonId;
  public readonly invitedBy: PersonId;
  public readonly invitedAt: Date;
  public acceptedAt?: Date;
  public status: InvitationStatus;

  /**
   * Constructs a new OrganizationInvitation instance.
   *
   * @param invitationId - Optional ID (default: new UUID).
   * @param organizationId - Target organization.
   * @param personId - Person being invited.
   * @param invitedBy - Person who sent the invitation.
   * @param invitedAt - Optional timestamp (default: now).
   * @param acceptedAt - Optional acceptance timestamp.
   * @param status - Optional status (default: PENDING).
   */
  constructor({
                invitationId = new OrganizationInvitationId(),
                organizationId,
                personId,
                invitedBy,
                invitedAt = new Date(),
                acceptedAt,
                status = InvitationStatus.PENDING
              }: {
    invitationId?: OrganizationInvitationId;
    organizationId: OrganizationId;
    personId: PersonId;
    invitedBy: PersonId;
    invitedAt?: Date;
    acceptedAt?: Date;
    status?: InvitationStatus;
  }) {
    if (!organizationId || !personId || !invitedBy) {
      throw new Error('Missing required fields in OrganizationInvitation.');
    }

    this.invitationId = invitationId;
    this.organizationId = organizationId;
    this.personId = personId;
    this.invitedBy = invitedBy;
    this.invitedAt = invitedAt;
    this.acceptedAt = acceptedAt;
    this.status = status;
  }

  /**
   * Accepts the invitation and sets its status to ACCEPTED.
   */
  accept(): void {
    if (this.status !== InvitationStatus.PENDING) {
      throw new Error('Only pending invitations can be accepted.');
    }

    this.status = InvitationStatus.ACCEPTED;
    this.acceptedAt = new Date();
  }

  /**
   * Rejects the invitation and sets its status to REJECTED.
   */
  reject(): void {
    if (this.status !== InvitationStatus.PENDING) {
      throw new Error('Only pending invitations can be rejected.');
    }

    this.status = InvitationStatus.REJECTED;
  }

  /**
   * Checks if the invitation is still pending.
   *
   * @returns True if status is PENDING.
   */
  isPending(): boolean {
    return this.status === InvitationStatus.PENDING;
  }

  /**
   * Serializes the invitation to JSON.
   */
  toJSON() {
    return {
      invitationId: this.invitationId.value,
      organizationId: this.organizationId.value,
      personId: this.personId.value,
      invitedBy: this.invitedBy.value,
      invitedAt: this.invitedAt.toISOString(),
      acceptedAt: this.acceptedAt?.toISOString() ?? null,
      status: this.status
    };
  }
}
