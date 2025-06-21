import { InvitationStatus } from './invitation-status.vo';

/**
 * Entity representing an invitation to join an organization.
 */
export class OrganizationInvitation {
  public readonly invitationId: number | undefined;
  public readonly organizationId: number | undefined;
  public readonly personId: number | undefined;
  public readonly invitedBy: string | undefined;
  public readonly invitedAt: Date;
  public acceptedAt?: Date;
  public status: InvitationStatus;

  /**
   * Constructs a new OrganizationInvitation instance.
   *
   * @param invitationId - Optional ID (default: new UUID).
   * @param organizationId - Target organization.
   * @param personId - ID of the person being invited.
   * @param invitedBy - Name of the person who sent the invitation.
   * @param invitedAt - Optional timestamp (default: now).
   * @param acceptedAt - Optional acceptance timestamp.
   * @param status - Optional status (default: PENDING).
   */
  constructor({
                invitationId,
                organizationId,
                personId,
                invitedBy,
                invitedAt = new Date(),
                acceptedAt,
                status = InvitationStatus.PENDING
              }: {
    invitationId?:  number;
    organizationId?: number;
    personId?: number;
    invitedBy?: string;
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
      invitationId: this.invitationId,
      organizationId: this.organizationId,
      personId: this.personId,
      invitedBy: this.invitedBy,
      invitedAt: this.invitedAt.toISOString(),
      acceptedAt: this.acceptedAt?.toISOString() ?? null,
      status: this.status
    };
  }
}
