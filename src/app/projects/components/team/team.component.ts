import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ProjectTeamMemberService } from '../../services/project-team-member.service';
import { OrganizationMemberService } from '../../../organizations/services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { SessionService } from '../../../iam/services/session.service';
import { ProjectService } from '../../services/project.service';

import { ProjectTeamMember } from '../../model/project-team-member.entity';
import { OrganizationMember } from '../../../organizations/model/organization-member.entity';
import { Person } from '../../../iam/model/person.entity';
import { ProjectRole } from '../../model/project-role.vo';
import { Specialty } from '../../model/specialty.vo';
import { Project } from '../../model/project.entity';

interface TeamMemberDisplay {
  id: string;
  name: string;
  role: ProjectRole;
  specialty: string;
  email: string;
  status: string;
}

interface OrganizationMemberDisplay {
  id: string;
  name: string;
  email: string;
  selected: boolean;
  role: ProjectRole | null;
  specialty: Specialty | null;
}

@Component({
  selector: 'app-team',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
  ],
  standalone: true,
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit, OnDestroy {
  @ViewChild('addMembersDialog') addMembersDialog!: TemplateRef<any>;
  @ViewChild('removeMemberDialog') removeMemberDialog!: TemplateRef<any>;

  // Propiedades para la tabla de miembros del equipo
  teamMembers: TeamMemberDisplay[] = [];
  displayedColumns: string[] = ['name', 'role', 'specialty', 'email', 'status', 'actions'];

  // Propiedades para la tabla de miembros de la organización
  orgMembers: OrganizationMemberDisplay[] = [];
  filteredOrgMembers: OrganizationMemberDisplay[] = [];
  searchQuery: string = '';

  // Propiedades para el formulario de asignación de roles
  memberForm: FormGroup;

  // Propiedad para miembro seleccionado (utilizado en eliminación)
  selectedMember: TeamMemberDisplay | null = null;

  // Valores para los selectores
  projectRoles = [ProjectRole.COORDINATOR, ProjectRole.SPECIALIST];
  specialties = Object.values(Specialty);

  // Propiedades de control
  loading = true;
  error: string | null = null;
  project: Project | null = null;
  projectId: string = '';
  orgId: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private teamMemberService: ProjectTeamMemberService,
    private orgMemberService: OrganizationMemberService,
    private personService: PersonService,
    private sessionService: SessionService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.memberForm = this.fb.group({
      members: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const projectIdVal = this.sessionService.getProjectId();
    this.projectId = projectIdVal !== undefined ? String(projectIdVal) : '';

    const orgIdVal = this.sessionService.getOrganizationId();
    this.orgId = orgIdVal !== undefined ? String(orgIdVal) : '';

    if (!this.projectId) {
      this.error = this.translate.instant('team.errors.no-project-id');
      this.loading = false;
      return;
    }

    this.loadProjectData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProjectData(): void {
    const projectSub = this.projectService.getById(null, { id: this.projectId })
      .subscribe({
        next: (project: any) => {
          this.project = project;
          this.loadTeamMembers();
        },
        error: (error: any) => {
          console.error('Error loading project:', error);
          this.error = this.translate.instant('team.errors.load-project');
          this.loading = false;
        }
      });

    this.subscriptions.push(projectSub);
  }

  loadTeamMembers(): void {
    const teamSub = this.teamMemberService.getByProjectId({ projectId: this.projectId })
      .pipe(
        switchMap((members: ProjectTeamMember[]) => {
          if (members.length === 0) {
            this.teamMembers = [];
            this.loading = false;
            return [];
          }

          // Obtenemos todos los miembros de una sola vez para evitar peticiones individuales que pueden fallar
          return this.personService.getAll().pipe(
            map((allPersons: Person[]) => {
              const personMap = new Map<number, Person>();
              allPersons.forEach(person => {
                if (person && person.id !== undefined) {
                  personMap.set(person.id, person);
                }
              });

              return members.map((member: ProjectTeamMember) => {
                // Buscar la persona en nuestro mapa de personas
                const personId = typeof member.personId === 'object' ? String(member.personId) : member.personId;
                const person = personMap.get(Number(personId));

                // Si no encontramos la persona, creamos una representación genérica
                const firstName = person?.firstName || 'Unknown';
                const lastName = person?.lastName || 'User';
                const email = person?.email

                return {
                  id: member.id.toString(),
                  name: `${firstName} ${lastName}`,
                  role: member.role,
                  specialty: member.specialty,
                  email: email,
                  status: 'ACTIVE' // Asumimos estado activo, esto puede cambiar según tu modelo
                };
              });
            })
          );
        })
      )
      .subscribe({
        next: (displayMembers: TeamMemberDisplay[]) => {
          this.teamMembers = displayMembers;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading team members:', error);
          this.error = this.translate.instant('team.errors.load-members');
          this.loading = false;
        }
      });

    this.subscriptions.push(teamSub);
  }

  openAddMembersDialog(): void {
    this.loading = true;

    // Resetear formulario y búsqueda
    this.searchQuery = '';
    this.memberForm = this.fb.group({
      members: this.fb.array([])
    });

    // Cargar miembros de la organización que no están en el proyecto
    this.loadOrganizationMembers()
      .then(() => {
        this.loading = false;
        this.dialog.open(this.addMembersDialog, {
          width: '800px',
          maxHeight: '90vh'
        });
      })
      .catch(error => {
        console.error('Error preparing dialog:', error);
        this.loading = false;
        this.snackBar.open(
          this.translate.instant('team.errors.load-org-members'),
          this.translate.instant('team.actions.close'),
          { duration: 5000 }
        );
      });
  }

  async loadOrganizationMembers(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Obtener los miembros actuales del equipo para excluirlos
      const currentTeamMemberIds = this.teamMembers.map(m => m.id);

      const orgSub = this.orgMemberService.getByOrganizationId({ organizationId: this.orgId })
        .pipe(
          switchMap((members: any) => {
            if (members && members.length === 0) {
              this.orgMembers = [];
              return [];
            }

            // Instead of making individual requests, get all persons at once
            return this.personService.getAll().pipe(
              map((allPersons: Person[]) => {
                // Create a map for quick person lookup by ID
                const personMap = new Map<number, Person>();
                allPersons.forEach(person => {
                  if (person && person.id !== undefined) {
                    personMap.set(person.id, person);
                  }
                });

                const displayMembers: OrganizationMemberDisplay[] = [];

                for (const member of members) {
                  if (!member || !member.personId) {
                    continue;
                  }

                  // Convert personId to number safely
                  const personIdRaw = member.personId;
                  const personIdNum = typeof personIdRaw === 'object'
                    ? parseInt(personIdRaw.toString(), 10)
                    : typeof personIdRaw === 'string'
                      ? parseInt(personIdRaw, 10)
                      : personIdRaw;

                  if (isNaN(personIdNum)) {
                    console.warn('Invalid person ID:', personIdRaw);
                    continue;
                  }

                  // Get person from our map
                  const person = personMap.get(personIdNum);

                  if (!person) {
                    console.warn(`Person with ID ${personIdNum} not found in database`);
                    continue;
                  }

                  // Safe email handling
                  let email = 'no-email@example.com';
                  if (person.email) {
                    email = typeof person.email === 'string' ? person.email : String(person.email);
                  }

                  // Check if already a team member
                  const isTeamMember = this.teamMembers.some(tm => tm.email === email);
                  if (isTeamMember) {
                    continue; // Skip if already a team member
                  }

                  // Add to display members
                  displayMembers.push({
                    id: member.id ? member.id.toString() : '',
                    name: `${person.firstName || ''} ${person.lastName || ''}`,
                    email: email,
                    selected: false,
                    role: null,
                    specialty: null
                  });
                }

                return displayMembers;
              })
            );
          })
        )
        .subscribe({
          next: (displayMembers: OrganizationMemberDisplay[]) => {
            this.orgMembers = displayMembers || [];
            this.filteredOrgMembers = [...this.orgMembers];
            resolve();
          },
          error: (error: any) => {
            console.error('Error loading organization members:', error);
            reject(error);
          }
        });

      this.subscriptions.push(orgSub);
    });
  }

  // Método para buscar miembros
  searchMembers(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOrgMembers = [...this.orgMembers];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredOrgMembers = this.orgMembers.filter((member: OrganizationMemberDisplay) =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  }

  // Métodos para el formulario dinámico
  toggleMemberSelection(member: OrganizationMemberDisplay): void {
    member.selected = !member.selected;

    const membersArray = this.memberForm.get('members') as FormArray;

    if (member.selected) {
      // Añadir al formulario
      membersArray.push(
        this.fb.group({
          id: [member.id],
          role: [null, Validators.required],
          specialty: [null]
        })
      );
    } else {
      // Eliminar del formulario
      const index = this.getFormArrayIndex(membersArray, member.id);
      if (index !== -1) {
        membersArray.removeAt(index);
      }

      // Resetear valores
      member.role = null;
      member.specialty = null;
    }
  }

  getFormArrayIndex(formArray: FormArray, memberId: string): number {
    return formArray.controls.findIndex(control =>
      control.get('id')?.value === memberId
    );
  }

  submitAddMembers(): void {
    if (this.memberForm.invalid) {
      this.snackBar.open(
        this.translate.instant('team.errors.invalid-form'),
        this.translate.instant('team.actions.close'),
        { duration: 5000 }
      );
      return;
    }

    const membersArray = this.memberForm.get('members') as FormArray;

    if (membersArray.length === 0) {
      this.snackBar.open(
        this.translate.instant('team.errors.no-members-selected'),
        this.translate.instant('team.actions.close'),
        { duration: 5000 }
      );
      return;
    }

    // Validar que los especialistas tengan especialidad asignada
    const invalidMembers = membersArray.controls.filter(control => {
      const roleValue = control.get('role')?.value;
      const specialtyValue = control.get('specialty')?.value;
      return roleValue === ProjectRole.SPECIALIST && !specialtyValue;
    });

    if (invalidMembers.length > 0) {
      this.snackBar.open(
        this.translate.instant('team.errors.specialists-need-specialty'),
        this.translate.instant('team.actions.close'),
        { duration: 5000 }
      );
      return;
    }

    this.loading = true;

    // Crear array de observables para cada nuevo miembro
    const addMemberRequests = membersArray.controls.map(control => {
      const memberId = control.get('id')?.value;
      const role = control.get('role')?.value;
      const specialty = control.get('specialty')?.value; // Valor por defecto si no es especialista

      // Encontrar el miembro de la organización correspondiente
      const orgMember = this.orgMembers.find(m => m.id === memberId);

      if (!orgMember) {
        throw new Error(`Organization member with ID ${memberId} not found`);
      }

      // Obtener el personId usando el método existente
      const personId = this.getPersonIdFromOrgMember(orgMember);

      // Crear el nuevo miembro del equipo
      const newTeamMember = new ProjectTeamMember({
        id: 0, // Valor temporal
        firstName: '',
        lastName: '',
        role: role,
        specialty: specialty,
        projectId: Number(this.projectId ? this.projectId.toString() : 0),
        personId: Number(personId)
      });

      return this.teamMemberService.create(newTeamMember);
    });

    // Procesar todas las solicitudes
    if (addMemberRequests.length > 0) {
      forkJoin(addMemberRequests)
        .subscribe({
          next: () => {
            this.dialog.closeAll();
            this.loading = false;

            this.snackBar.open(
              this.translate.instant('team.success.members-added'),
              this.translate.instant('team.actions.close'),
              { duration: 3000 }
            );

            // Recargar los miembros del equipo
            this.loadTeamMembers();
          },
          error: (error) => {
            console.error('Error adding team members:', error);
            this.loading = false;

            this.snackBar.open(
              this.translate.instant('team.errors.add-members'),
              this.translate.instant('team.actions.close'),
              { duration: 5000 }
            );
          }
        });
    } else {
      this.loading = false;
      this.dialog.closeAll();
    }
  }

  // Método para extraer el personId de un miembro de la organización
  // Esto podría necesitar ajustes según cómo esté estructurada tu aplicación
  private getPersonIdFromOrgMember(orgMember: OrganizationMemberDisplay): string {
    // Asumimos que tenemos el email y podemos encontrar a la persona por él
    return orgMember.id;
  }

  // Traducciones para roles y especialidades
  getProjectRoleTranslation(role: ProjectRole): string {
    return this.translate.instant(`team.roles.${role}`);
  }

  getSpecialtyTranslation(specialty: string): string {
    return this.translate.instant(`team.specialties.${specialty}`);
  }

  // Métodos para actualizar roles y especialidades durante la adición de miembros
  updateMemberRole(member: OrganizationMemberDisplay, role: ProjectRole): void {
    member.role = role;

    const membersArray = this.memberForm.get('members') as FormArray;
    const index = this.getFormArrayIndex(membersArray, member.id);

    if (index !== -1) {
      const memberGroup = membersArray.at(index) as FormGroup;
      memberGroup.patchValue({ role });

      // Si el rol no es especialista, eliminamos la especialidad
      if (role !== ProjectRole.SPECIALIST) {
        memberGroup.patchValue({ specialty: null });
        member.specialty = null;
      } else if (!member.specialty) {
        // Si es especialista pero no tiene especialidad, marcamos el campo como requerido
        memberGroup.get('specialty')?.setValidators(Validators.required);
        memberGroup.get('specialty')?.updateValueAndValidity();
      }
    }
  }

  updateMemberSpecialty(member: OrganizationMemberDisplay, specialty: Specialty): void {
    member.specialty = specialty;

    const membersArray = this.memberForm.get('members') as FormArray;
    const index = this.getFormArrayIndex(membersArray, member.id);

    if (index !== -1) {
      const memberGroup = membersArray.at(index) as FormGroup;
      memberGroup.patchValue({ specialty });
    }
  }

  // Métodos para eliminar miembros
  openRemoveMemberDialog(member: TeamMemberDisplay): void {
    this.selectedMember = member;
    this.dialog.open(this.removeMemberDialog, {
      width: '500px'
    });
  }

  submitRemoveMember(): void {
    if (!this.selectedMember) {
      return;
    }

    this.loading = true;

    // Obtener el ID del miembro seleccionado y ejecutar un GET primero para obtener el objeto completo
    const memberId = this.selectedMember.id;

    // Crear un objeto ProjectTeamMemberId para el ID
    // import { ProjectTeamMemberId } from '../../../shared/model/project-team-member-id.vo';
    // const idObject = new ProjectTeamMemberId(memberId);

    // Primero hacemos un getById para obtener el objeto completo
    this.teamMemberService.getById(null, { id: memberId })
      .subscribe({
        next: (memberData: ProjectTeamMember) => {

          // Ahora que tenemos el objeto completo, procedemos a eliminarlo
          this.teamMemberService.delete(null, { id: memberData.id.toString() })
            .subscribe({
              next: (response: any) => {
                this.dialog.closeAll();
                this.loading = false;

                this.snackBar.open(
                  this.translate.instant('team.success.member-removed'),
                  this.translate.instant('team.actions.close'),
                  { duration: 3000 }
                );

                // Recargar los miembros del equipo
                this.loadTeamMembers();
              },
              error: (error: any) => {
                console.error('Error detallado al eliminar miembro del equipo:', error);
                if (error.status) {
                  console.error('Estado HTTP:', error.status);
                }
                if (error.error) {
                  console.error('Error del servidor:', error.error);
                }
                this.loading = false;

                this.snackBar.open(
                  this.translate.instant('team.errors.remove-member'),
                  this.translate.instant('team.actions.close'),
                  { duration: 5000 }
                );
              }
            });
        },
        error: (error: any) => {
          console.error('Error al obtener el miembro del equipo para eliminarlo:', error);
          this.loading = false;

          this.snackBar.open(
            this.translate.instant('team.errors.remove-member'),
            this.translate.instant('team.actions.close'),
            { duration: 5000 }
          );
        }
      });
  }
}
