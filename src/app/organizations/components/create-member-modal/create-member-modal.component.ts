import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';
import { PersonService } from '../../../iam/services/person.service';
import { UserAccountService } from '../../../iam/services/user-account.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { SessionService } from '../../../iam/services/session.service';

/**
 * Component that displays a modal to invite a new member to the organization.
 * It allows the user to select a person and assign them a member type
 * (e.g., WORKER), filtering out those already in the organization.
 */
@Component({
  selector: 'app-create-member-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './create-member-modal.component.html',
  styleUrl: './create-member-modal.component.css'
})
export class CreateMemberModalComponent implements OnInit {
  /** List of people eligible to be invited */
  people: { id: string; fullName: string; email: string }[] = [];

  /** Selected person's ID */
  selectedPersonId: string | null = null;

  /** Selected member type, defaults to WORKER */
  memberType: OrganizationMemberType = OrganizationMemberType.WORKER;

  /** Options for available member types */
  readonly memberTypes = [
    { value: OrganizationMemberType.WORKER, label: 'create-member.worker' }
  ];

  constructor(
    private dialogRef: MatDialogRef<CreateMemberModalComponent>,
    private personService: PersonService,
    private userAccountService: UserAccountService,
    private organizationMemberService: OrganizationMemberService,
    private session: SessionService
  ) {}

  /**
   * Angular lifecycle hook: runs when the component is initialized.
   * Closes the modal if no organization ID is available.
   */
  ngOnInit(): void {
    const organizationId = this.session.getOrganizationId();

    if (!organizationId) {
      console.error('No organization ID found in the session');
      this.dialogRef.close();
      return;
    }

    this.loadEligiblePeople(organizationId.toString());
  }

  /** Closes the modal without saving any changes */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the modal and returns selected member info if the form is valid.
   */
  submit(): void {
    if (this.isFormValid) {
      this.dialogRef.close({
        personId: this.selectedPersonId,
        memberType: this.memberType
      });
    }
  }

  /**
   * Checks if the form is complete and valid.
   * @returns true if both person and member type are selected
   */
  get isFormValid(): boolean {
    return !!this.selectedPersonId && !!this.memberType;
  }

  /**
   * Loads people who:
   * - Have an active ORGANIZATION_USER account
   * - Are NOT already members of the current organization
   * @param organizationId The ID of the organization to check membership against
   */
  private loadEligiblePeople(organizationId: string): void {
    this.personService.getAll().subscribe({
      next: (people: any[]) => {
        this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
          next: (members: any[]) => {
            const memberPersonIds = members
              .filter(m => m.organizationId === organizationId)
              .map(m => m.personId);

            this.userAccountService.getAll().subscribe({
              next: (accounts: any[]) => {
                const orgUserAccounts = accounts.filter(account =>
                  account?.role === 'ORGANIZATION_USER'
                );

                const orgUserPersonIds = orgUserAccounts.map(account => account.personId);

                // Filter out people who are already members
                const eligiblePeople = people
                  .filter(person =>
                    person?.id &&
                    orgUserPersonIds.includes(person.id) &&
                    !memberPersonIds.includes(person.id)
                  )
                  .map(person => ({
                    id: person.id,
                    fullName: person.firstName && person.lastName
                      ? `${person.firstName} ${person.lastName}`
                      : 'Name not available',
                    email: person.email
                  }));

                this.people = eligiblePeople;
              },
              error: (err: any) => {
                console.error('Failed to load user accounts:', err);
              }
            });
          },
          error: (err: any) => {
            console.error('Failed to load organization members:', err);
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load people:', err);
      }
    });
  }
}
