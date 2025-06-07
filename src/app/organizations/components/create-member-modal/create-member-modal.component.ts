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
  // Lista de personas elegibles (usuarios con rol ORGANIZATION_USER que no son miembros aún)
  people: { id: string; fullName: string; email: string }[] = [];
  selectedPersonId: string | null = null;
  memberType: OrganizationMemberType = OrganizationMemberType.WORKER; // Por defecto WORKER

  // Solo permitir WORKER para nuevos miembros (CONTRACTOR es solo para el creador)
  memberTypes = [
    { value: OrganizationMemberType.WORKER, label: 'create-member.worker' }
  ];
  constructor(
    private dialogRef: MatDialogRef<CreateMemberModalComponent>,
    private personService: PersonService,
    private userAccountService: UserAccountService,
    private organizationMemberService: OrganizationMemberService,
    private session: SessionService
  ) {}  ngOnInit(): void {
    const organizationId = this.session.getOrganizationId();
    
    if (!organizationId) {
      console.error('No se encontró ID de organización en la sesión');
      this.dialogRef.close();
      return;
    }
    
    // Enfoque simplificado: cargar todas las personas, después filtraremos
    this.loadEligiblePeople(organizationId);
  }
  
  /**
   * Carga las personas elegibles para ser añadidas como miembros
   * (usuarios con rol ORGANIZATION_USER que no son ya miembros)
   */
  private loadEligiblePeople(organizationId: string): void {
    // Cargar todas las personas
    this.personService.getAll().subscribe({
      next: (people: any[]) => {
        if (!people || !Array.isArray(people)) {
          return;
        }
        
        // Obtener miembros actuales para filtrar
        this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
          next: (members: any[]) => {
            // IDs de personas que ya son miembros
            const memberPersonIds = members.map(m => m.personId.toString());
            
            // Cargar cuentas de usuario para filtrar por rol
            this.userAccountService.getAll().subscribe({
              next: (accounts: any[]) => {
                // Filtrar cuentas con rol ORGANIZATION_USER
                const orgUserAccounts = accounts.filter(account => 
                  account && account.role === 'ORGANIZATION_USER'
                );
                
                // IDs de personas que son usuarios de organización
                const orgUserIds = orgUserAccounts.map(account => account.personId);
                
                // Filtrar personas que:
                // 1. Son usuarios de organización
                // 2. No son ya miembros de esta organización
                const eligiblePeople = people
                  .filter(person => 
                    person && 
                    person.id && 
                    orgUserIds.includes(person.id) && 
                    !memberPersonIds.includes(person.id)
                  )
                  .map(person => ({
                    id: person.id.toString(),
                    fullName: person.firstName && person.lastName 
                      ? `${person.firstName} ${person.lastName}` 
                      : 'Nombre no disponible',
                    email: person.email || 'Email no disponible'
                  }));
                
                this.people = eligiblePeople;
              },
              error: (err: unknown) => {
                console.error('Error al cargar cuentas de usuario:', err);
              }
            });
          },
          error: (err: unknown) => {
            console.error('Error al cargar miembros:', err);
          }
        });
      },
      error: (err: unknown) => {
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
