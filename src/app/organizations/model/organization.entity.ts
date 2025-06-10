import { OrganizationStatus } from './organization-status.vo';
import { Ruc } from './ruc.vo';
import { OrganizationMember } from './organization-member.entity';
import { OrganizationInvitation } from './organization-invitation.entity';

/**
 * Aggregate root representing an Organization entity.
 */
export class Organization {
  public readonly id: number|undefined;
  public legalName: string;
  public commercialName?: string;
  public readonly ruc: Ruc;
  public readonly createdBy: number|undefined;
  public readonly createdAt: Date;
  public status: OrganizationStatus;

  public readonly members: OrganizationMember[] = [];
  public readonly invitations: OrganizationInvitation[] = [];

  /**
   * Constructs a new Organization instance.
   *
   * @param organizationId - Optional ID (default: new UUID).
   * @param legalName - Registered legal name.
   * @param commercialName - Optional commercial name.
   * @param ruc - Unique tax ID.
   * @param createdBy - Person who created the organization.
   * @param createdAt - Optional creation timestamp (default: now).
   * @param status - Optional organization status (default: ACTIVE).
   * @param members - Optional existing members.
   * @param invitations - Optional existing invitations.
   */
  constructor({
                id,
                legalName,
                commercialName,
                ruc,
                createdBy,
                createdAt = new Date(),
                status,
                members = [],
                invitations = []
              }: {
    id?: number;
    legalName: string;
    commercialName?: string;
    ruc: Ruc;
    createdBy?: number;
    createdAt?: Date;
    status: OrganizationStatus;
    members?: OrganizationMember[];
    invitations?: OrganizationInvitation[];
  }) {
    if (!legalName || !ruc || !createdBy) {
      throw new Error('Missing required fields in Organization.');
    }

    this.id = id;
    this.legalName = legalName;
    this.commercialName = commercialName;
    this.ruc = ruc;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.status = status;
    this.members = members;
    this.invitations = invitations;
  }

  /**
   * Updates the legal name of the organization.
   * @param name New legal name.
   */
  updateLegalName(name: string): void {
    this.legalName = name;
  }

  /**
   * Updates or sets the commercial name of the organization.
   * @param name New commercial name.
   */
  updatecommercialName(name: string): void {
    this.commercialName = name;
  }

  /**
   * Marks the organization as inactive.
   */
  deactivate(): void {
    this.status = OrganizationStatus.INACTIVE;
  }

  /**
   * Serializes the organization to JSON.
   */
  toJSON() {
    return {
      organizationId: this.id,
      legalName: this.legalName,
      commercialName: this.commercialName,
      ruc: this.ruc.value,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
      members: this.members.map(m => m.toJSON()),
      invitations: this.invitations.map(i => i.toJSON())
    };
  }
}
