import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SessionService} from '../../../iam/services/session.service';
import {OrganizationMemberService} from '../../services/organization-member.service';
import {OrganizationService} from '../../services/organization.service';
import {OrganizationInvitationService} from '../../services/organization-invitation.service';
import {OrganizationMember} from '../../model/organization-member.entity';
import {CreateMemberModalComponent} from '../create-member-modal/create-member-modal.component';
import {DeleteMemberModalComponent} from '../delete-member-modal/delete-member-modal.component';
import {MemberCardComponent} from '../member-card/member-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {PersonService} from '../../../iam/services/person.service';
import {Person} from '../../../iam/model/person.entity';
import {OrganizationInvitation} from '../../model/organization-invitation.entity';
import {InvitationStatus} from '../../model/invitation-status.vo';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MemberCardComponent,
    TranslatePipe
  ],
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {
  members = signal<MemberDisplay[]>([]);
  isCreator = signal<boolean>(false);
  currentPersonId = signal<string | null>(null);

  constructor(
    private session: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private organizationInvitationService: OrganizationInvitationService,
    private snackBar: MatSnackBar,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.checkCreatorStatus();
  }

  private checkCreatorStatus(): void {
    const orgId = this.session.getOrganizationId();
    const personId = this.session.getPersonId();

    if (!orgId || !personId) return this.isCreator.set(false);

    this.organizationService.isOrganizationCreator(orgId, personId).subscribe({
      next: (res) => this.isCreator.set(res),
      error: (err) => {
        console.error('Error checking creator status:', err);
        this.isCreator.set(false);
      }
    });
  }

  readonly sortedMembers = computed(() =>
    this.members().slice().sort((a, b) => a.fullName.localeCompare(b.fullName))
  );

  openInvitationModal(): void {
    const dialogRef = this.dialog.open(CreateMemberModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createMember(result);
      }
    });
  }

  async createMember(memberData: Person): Promise<void> {
    const organizationId = this.session.getOrganizationId();
    const invitedBy = this.session.getPersonId();

    if (!organizationId || !invitedBy) {
      console.error('No organizationId or personId found in session');
      return;
    }
    console.log("XD");
    const invitationSender: Person = await this.personService.getById({}, {id: invitedBy}).toPromise();
    console.log("XD2");
    const invitation = new OrganizationInvitation({
      organizationId: organizationId,
      personId: memberData.id,
      invitedBy: `${invitationSender.firstName} ${invitationSender.lastName}`.trim(),
      invitedAt: new Date(),
      status: InvitationStatus.PENDING
    });
    console.log("XD3");

    this.organizationInvitationService.create(invitation).subscribe({
      next: () => {
        this.snackBar.open('Invitation sent successfully', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: (err: unknown) => {
        this.snackBar.open('Error sending invitation', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
        console.error('Error sending invitation:', err);
      }
    });
  }

  private loadMembers(): void {
    const organizationId = this.session.getOrganizationId();

    if (!organizationId) {
      console.warn('No organization ID found in session. Aborting members load.');
      return;
    }

    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (members: OrganizationMember[]) => {
        this.members.set(
          members.map((member) => ({
            memberType: member.memberType,
            joinedAt: member.joinedAt,
            fullName: `${member.name ?? ''} ${member.lastName ?? ''}`.trim(),
            email: member.email ?? '',
            member
          }))
        );
      },
      error: (err: any) => {
        console.error('Failed to load organization members:', err);
        this.members.set([]);
      }
    });
  }

  removeMember(member: OrganizationMember): void {
    const currentUserId = this.session.getPersonId();

    if (!this.isCreator()) {
      this.snackBar.open('No tienes permisos para eliminar miembros', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (member.memberType === 'CONTRACTOR' && member.personId?.toString() === currentUserId?.toString()) {
      this.snackBar.open('No puedes eliminar al creador de la organización', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    const dialogRef = this.dialog.open(DeleteMemberModalComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed || !member.id) return;

      this.organizationMemberService.delete({}, { id: member.id }).subscribe({
        next: () => {
          this.snackBar.open('Miembro eliminado con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });

          this.organizationInvitationService.getAll().subscribe((invitations: any[]) => {
            const toDelete = invitations.filter(inv =>
              inv.personId === member.personId && inv.organizationId === member.organizationId
            );

            toDelete.forEach(inv =>
              this.organizationInvitationService.delete({}, { id: inv.id }).subscribe()
            );
          });

          this.loadMembers();
        },
        error: (err: unknown) => {
          console.error('Error al eliminar miembro:', err);
          this.snackBar.open('Error al eliminar miembro', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    });
  }
}

//displaying in view
interface MemberDisplay {
  memberType: string;
  joinedAt: Date;
  fullName: string;
  email: string;
  member: OrganizationMember;
}
