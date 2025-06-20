import { Injectable, signal, effect } from '@angular/core';
import {UserType} from '../model/user-type.vo';
import {OrganizationMemberType} from '../../organizations/model/organization-member-type.vo';
import { ProjectRole } from '../../projects/model/project-role.vo';

export type userType = UserType.TYPE_WORKER | UserType.TYPE_CLIENT;

@Injectable({ providedIn: 'root' })
export class SessionService {
  // SIGNALS
  private personId = signal<number | undefined>(this.loadFromStorage('personId'));
  private userType = signal<userType | undefined>(this.loadFromStorage('userType'));
  private organizationId = signal<number | undefined>(this.loadFromStorage('organizationId'));
  private organizationRole = signal<OrganizationMemberType | undefined>(this.loadFromStorage('organizationRole'));
  private projectId = signal<number | undefined>(this.loadFromStorage('projectId'));
  private projectRole = signal<ProjectRole | undefined>(this.loadFromStorage('projectRole'));
  private milestoneId = signal<number | undefined>(this.loadFromStorage('milestoneId'));
  private token = signal<string | undefined>(this.loadFromStorage('token'));

  constructor() {
    // Persistencia reactiva automática
    effect(() => {
      this.saveToStorage('personId', this.personId());
      this.saveToStorage('userType', this.userType());
      this.saveToStorage('organizationId', this.organizationId());
      this.saveToStorage('organizationRole', this.organizationRole());
      this.saveToStorage('projectId', this.projectId());
      this.saveToStorage('projectRole', this.projectRole());
      this.saveToStorage('milestoneId', this.milestoneId());
      this.saveToStorage('token', this.token());
    });
  }

  // Setters
  setPersonId(id: number) {
    this.personId.set(id);
  }

  setUserType(type: userType) {
    this.userType.set(type);
  }

  setOrganization(id: number | undefined, role: OrganizationMemberType) {
    this.organizationId.set(id);
    this.organizationRole.set(role);
  }

  setProject(id: number, role: ProjectRole | undefined) {
    this.projectId.set(id);
    this.projectRole.set(role);
  }

  setMilestone(id: number) {
    this.milestoneId.set(id);
    this.saveToStorage('milestoneId', id);
  }

  setToken(token: string) {
    this.token.set(token);
    this.saveToStorage('token', token);
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

  clearToken() {
    this.token.set(undefined);
    this.saveToStorage('token', undefined);
  }

  clearAll() {
    this.userType.set(undefined);
    this.clearOrganization();
    this.clearProject();
    this.clearMilestone();
    this.clearToken();
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

  getOrganizationRole(): OrganizationMemberType | undefined {
    return this.organizationRole();
  }

  getProjectId(): number | undefined {
    return this.projectId();
  }

  getProjectRole(): ProjectRole | undefined {
    return this.projectRole();
  }

  getMilestoneId(): number | undefined {
    return this.milestoneId();
  }

  getToken(): string | undefined {
    return this.token();
  }

  private saveToStorage(key: string, value: any) {
    if (value !== undefined) {
      if (key === 'token' && typeof value === 'string') {
        localStorage.setItem(key, value); // guarda el token tal cual
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
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
