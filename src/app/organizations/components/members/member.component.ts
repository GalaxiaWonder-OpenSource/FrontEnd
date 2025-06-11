import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { OrganizationService } from '../../services/organization.service';
import { OrganizationInvitationService } from '../../services/organization-invitation.service';
import { OrganizationMember } from '../../model/organization-member.entity';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';
import { DeleteMemberModalComponent } from '../delete-member-modal/delete-member-modal.component';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MemberCardComponent
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
    private personService: PersonService,
    private dialog: MatDialog,
    private organizationInvitationService: OrganizationInvitationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.checkCreatorStatus();
  }

  private checkCreatorStatus(): void {
    const organizationId = this.session.getOrganizationId();
    const personId = this.session.getPersonId();

    console.log('🔍 organizationId:', organizationId, typeof organizationId);
    console.log('🔍 personId:', personId, typeof personId);

    if (!organizationId || !personId) {
      console.log('❌ No organizationId or personId');
      this.isCreator.set(false);
      return;
    }

    console.log('🔍 Calling isOrganizationCreator with:', organizationId.toString(), personId.toString());

    this.organizationService.isOrganizationCreator(organizationId, personId).subscribe({
      next: (isCreator) => {
        console.log('✅ isCreator result:', isCreator);
        this.isCreator.set(isCreator);
      },
      error: (err: unknown) => {
        console.error('❌ Error checking if user is creator:', err);
        this.isCreator.set(false);
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
      next: (allMembers: OrganizationMember[]) => {
        console.log(allMembers);
        const myOrganizationMembers = allMembers.filter(m =>
          m.organizationId != undefined ? m.organizationId.toString() === organizationId.toString() : false
        );

        const uniqueMembers = myOrganizationMembers.filter((member, index) => {
          const personIdStr = member.personId?.toString();
          const firstIndex = myOrganizationMembers.findIndex(m => m.personId?.toString() === personIdStr);
          return firstIndex === index;
        });

        if (uniqueMembers.length === 0) {
          this.members.set([]);
          return;
        }

        Promise.all(
          uniqueMembers.map((member: OrganizationMember) =>
            this.personService.getById({}, { id: member.personId })
              .toPromise()
              .then((person: any) => ({ member, person }))
          )
        ).then(
          (memberPersonPairs: Array<{ member: OrganizationMember; person: any }>) => {
            const enrichedMembers = memberPersonPairs.map(({ member, person }) => {
              let joinedAt = new Date();
              if (member.joinedAt) {
                joinedAt = new Date(member.joinedAt);
                if (isNaN(joinedAt.getTime())) joinedAt = new Date();
              }

              return {
                memberType: member.memberType,
                joinedAt,
                fullName: `${person.firstName} ${person.lastName}`,
                email: person.email,
                member
              };
            });

            this.members.set(enrichedMembers);
          },
          (error) => {
            console.error('Failed to load one or more persons:', error);
            this.members.set([]);
          }
        );
      },
      error: (err: any) => {
        console.error('Failed to load organization members:', err);
        this.members.set([]);
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

  private createMember(memberData: any): void {
    const organizationId = this.session.getOrganizationId();
    const invitedBy = this.session.getPersonId();

    if (!organizationId || !invitedBy) {
      console.error('No organization ID or invitedBy found in session');
      return;
    }

    const invitation = {
      organizationId: organizationId.toString(),
      personId: memberData.personId.toString(),
      invitedBy: invitedBy.toString()
    };

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

  removeMember(member: OrganizationMember): void {
    if (!this.isCreator() ||
      (member.memberType === 'CONTRACTOR' && member.personId?.toString() === this.currentPersonId())) {
      console.warn('You do not have permission to remove this member or you are trying to remove the creator');
      return;
    }

    const dialogRef = this.dialog.open(DeleteMemberModalComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.organizationMemberService.delete({}, { id: member.id }).subscribe({
          next: () => {
            this.organizationInvitationService.getAll().subscribe((invitations: any[]) => {
              const toDelete = invitations.filter(inv => inv.personId === member.personId && inv.organizationId === member.organizationId);
              toDelete.forEach(inv => {
                this.organizationInvitationService.delete({}, { id: inv.id }).subscribe();
              });
            });
            this.loadMembers();
          },
          error: (err: unknown) => {
            console.error('Error removing member:', err);
          }
        });
      }
    });
  }
}

// Type for displaying in view
interface MemberDisplay {
  memberType: string;
  joinedAt: Date;
  fullName: string;
  email: string;
  member: OrganizationMember;
}
