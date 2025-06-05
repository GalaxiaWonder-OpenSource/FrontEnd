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
import { Person } from '../../../iam/model/person.entity';

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

  people: { id: string; fullName: string; email: string }[] = [];
  selectedPersonId: string | null = null;
  memberType: OrganizationMemberType = OrganizationMemberType.CONTRACTOR;

  memberTypes = [
    { value: OrganizationMemberType.CONTRACTOR, label: 'create-member.contractor' },
    { value: OrganizationMemberType.WORKER, label: 'create-member.worker' }
  ];

  constructor(
    private dialogRef: MatDialogRef<CreateMemberModalComponent>,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    this.personService.getAll().subscribe({
      next: (data: any[]) => {
        if (data && Array.isArray(data)) {
          this.people = data
            .filter(item => item && item.id) // Filtrar elementos válidos
            .map((item: any) => ({
              id: item.id.toString(),
              fullName: item.fullName ||
                (item.firstName && item.lastName ?
                  `${item.firstName} ${item.lastName}` :
                  'Nombre no disponible'),
              email: item.email || 'Email no disponible'
            }));
        }
      },
      error: (err: any) => {
        console.error('Error al cargar personas:', err);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.isFormValid) {
      this.dialogRef.close({
        personId: this.selectedPersonId,
        memberType: this.memberType
      });
    }
  }

  get isFormValid(): boolean {
    return this.selectedPersonId !== null &&
      this.selectedPersonId !== '' &&
      !!this.memberType;
  }
}
