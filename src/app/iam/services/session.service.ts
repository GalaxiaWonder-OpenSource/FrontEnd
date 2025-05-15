import { Injectable, signal, effect } from '@angular/core';
import {UserRole} from '../model/user-role.vo';
import {PersonId} from '../../shared/model/person-id.vo';
import {OrganizationMemberType} from '../../organizations/model/organization-member-type.vo';

type UserType = UserRole.ORGANIZATION_USER | UserRole.CLIENT_USER ;
type OrgRole = OrganizationMemberType.CONTRACTOR | OrganizationMemberType.WORKER;
type ProjectRole = 'Contractor' | 'Coordinator' | 'Specialist' | 'Client' | null;

@Injectable({ providedIn: 'root' })
export class SessionService {
  // SIGNALS
  private personId = signal<PersonId | null>(this.loadFromStorage('personId'));
  private userType = signal<UserType | null>(this.loadFromStorage('userType'));
  private organizationId = signal<string | null>(this.loadFromStorage('organizationId'));
  private organizationRole = signal<OrgRole | null>(this.loadFromStorage('organizationRole'));
  private projectId = signal<string | null>(this.loadFromStorage('projectId'));
  private projectRole = signal<ProjectRole>(this.loadFromStorage('projectRole'));
  private milestoneId = signal<string | null>(this.loadFromStorage('milestoneId'));

  constructor() {
    // Persistencia reactiva automática
    effect(() => {
      this.saveToStorage('personId', this.personId());
      this.saveToStorage('userType', this.userType());
      this.saveToStorage('organizationId', this.organizationId());
      this.saveToStorage('organizationRole', this.organizationRole());
      this.saveToStorage('projectId', this.projectId());
      this.saveToStorage('projectRole', this.projectRole());
    });
  }

  // Setters
  setPersonId(id: PersonId) {
    this.personId.set(id);
  }

  setUserType(type: UserType) {
    this.userType.set(type);
  }

  setOrganization(id: string, role: OrgRole) {
    this.organizationId.set(id);
    this.organizationRole.set(role);
  }

  setProject(id: string, role: ProjectRole) {
    this.projectId.set(id);
    this.projectRole.set(role);
  }

  setMilestone(id: string) {
    this.milestoneId.set(id);
    this.saveToStorage('milestoneId', id);
  }

  // Limpieza
  clearIdentity() {
    this.personId.set(null);
    this.userType.set(null);
  }

  clearOrganization() {
    this.organizationId.set(null);
    this.organizationRole.set(null);
  }

  clearProject() {
    this.projectId.set(null);
    this.projectRole.set(null);
  }

  clearMilestone() {
    this.milestoneId.set(null);
    this.saveToStorage('milestoneId', null);
  }

  clearAll() {
    this.userType.set(null);
    this.clearOrganization();
    this.clearProject();
    this.clearMilestone();
  }

  // Getters
  getPersonId(): PersonId | null {
    return this.personId();
  }

  getUserType(): UserType | null {
    return this.userType();
  }

  getOrganizationId(): string | null {
    return this.organizationId();
  }

  getOrganizationRole(): OrgRole | null {
    return this.organizationRole();
  }

  getProjectId(): string | null {
    return this.projectId();
  }

  getProjectRole(): ProjectRole {
    return this.projectRole();
  }

  getMilestoneId(): string | null {
    return this.milestoneId();
  }

  // Helpers de persistencia
  private saveToStorage(key: string, value: any) {
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }

  private loadFromStorage(key: string): any {
    const val = localStorage.getItem(key);
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }
}
