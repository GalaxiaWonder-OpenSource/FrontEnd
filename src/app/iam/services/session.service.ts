import { Injectable, signal, effect } from '@angular/core';
import {UserRole} from '../model/user-role.vo';
import {OrganizationMemberType} from '../../organizations/model/organization-member-type.vo';

export type UserType = UserRole.ORGANIZATION_USER | UserRole.CLIENT_USER;
export type OrgRole = OrganizationMemberType.CONTRACTOR | OrganizationMemberType.WORKER;
export type ProjectRole = 'Contractor' | 'Coordinator' | 'Specialist' | 'Client' | undefined;

@Injectable({ providedIn: 'root' })
export class SessionService {
  // SIGNALS
  private personId = signal<number | undefined>(this.loadFromStorage('personId'));
  private userType = signal<UserType | undefined>(this.loadFromStorage('userType'));
  private organizationId = signal<number | undefined>(this.loadFromStorage('organizationId'));
  private organizationRole = signal<OrgRole | undefined>(this.loadFromStorage('organizationRole'));
  private projectId = signal<string | undefined>(this.loadFromStorage('projectId'));
  private projectRole = signal<ProjectRole>(this.loadFromStorage('projectRole'));
  private milestoneId = signal<string | undefined>(this.loadFromStorage('milestoneId'));

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
  setPersonId(id: number) {
    this.personId.set(id);
  }

  setUserType(type: UserType) {
    this.userType.set(type);
  }

  setOrganization(id: number | undefined, role: OrgRole) {
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
    this.personId.set(undefined);
    this.userType.set(undefined);
  }

  clearOrganization() {
    this.organizationId.set(undefined);
    this.organizationRole.set(undefined);
  }

  clearProject() {
    this.projectId.set(undefined);
    this.projectRole.set(undefined);
  }

  clearMilestone() {
    this.milestoneId.set(undefined);
    this.saveToStorage('milestoneId', undefined);
  }

  clearAll() {
    this.userType.set(undefined);
    this.clearOrganization();
    this.clearProject();
    this.clearMilestone();
  }

  // Getters
  getPersonId(): number | undefined {
    return this.personId();
  }

  getUserType(): UserType | undefined {
    return this.userType();
  }

  getOrganizationId(): number | undefined {
    return this.organizationId();
  }

  getOrganizationRole(): OrgRole | undefined {
    return this.organizationRole();
  }

  getProjectId(): string | undefined {
    return this.projectId();
  }

  getProjectRole(): ProjectRole {
    return this.projectRole();
  }

  getMilestoneId(): string | undefined {
    return this.milestoneId();
  }

  // Helpers de persistencia
  private saveToStorage(key: string, value: any) {
    if (value !== undefined && value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }

  private loadFromStorage(key: string): any {
    const val = localStorage.getItem(key);
    try {
      return val ? JSON.parse(val) : undefined;
    } catch {
      return undefined;
    }
  }
}
