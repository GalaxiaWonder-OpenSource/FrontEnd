import { OrganizationStatus } from './organization-status.vo';
import { Ruc } from './ruc.vo';
import { OrganizationMember } from './organization-member.entity';
import { OrganizationInvitation } from './organization-invitation.entity';

/**
 * Aggregate root representing an Organization entity.
 */
export class Organization {
  public readonly id: number | undefined;
  public legalName: string;
  public commercialName: string;
  public readonly ruc: Ruc;
  public readonly createdBy?: number;
  public readonly createdAt: Date;
  public status: OrganizationStatus;

  public readonly members: OrganizationMember[] = [];
  public readonly invitations: OrganizationInvitation[] = [];

  /**
   * Constructs a new Organization instance.
   */
  constructor({
                id,
                legalName,
                commercialName,
                ruc,
                createdBy,
                createdAt = new Date(),
                status = OrganizationStatus.ACTIVE,
                members = [],
                invitations = []
              }: {
    id?: number;
    legalName?: string;
    commercialName?: string;
    ruc?: Ruc;
    createdBy?: number;
    createdAt?: Date;
    status?: OrganizationStatus;
    members?: OrganizationMember[];
    invitations?: OrganizationInvitation[];
  }) {
    if (!legalName || !ruc) {
      console.warn('Organization constructed with missing required fields:', {
        legalName,
        ruc,
        createdBy
      });
    }

    this.id = id;
    this.legalName = legalName ?? '';
    this.commercialName = commercialName ?? '';
    this.ruc = ruc ?? new Ruc();
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.status = status;
    this.members = members;
    this.invitations = invitations;
  }

  /**
   * Serializes the organization to JSON.
   */
  toJSON() {
    return {
      organizationId: this.id,
      legalName: this.legalName,
      commercialName: this.commercialName,
      ruc: this.ruc?.value ?? null,
      createdBy: this.createdBy ?? null,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
      members: this.members.map(m => m.toJSON()),
      invitations: this.invitations.map(i => i.toJSON())
    };
  }
}
