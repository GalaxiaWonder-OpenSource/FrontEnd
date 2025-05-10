import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

type UserType = 'Worker' | 'Client';
type OrgRole = 'Contractor' | 'Worker';
type ProjectRole = 'Coordinator' | 'Specialist' | 'Client' | null;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private userType = signal<UserType | null>(null);

  private organizationId = signal<string | null>(null);
  private organizationRole = signal<OrgRole | null>(null);

  private projectId = signal<string | null>(null);
  private projectRole = signal<ProjectRole>(null);

  // Setters
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

  // Clearers
  clearOrganization() {
    this.organizationId.set(null);
    this.organizationRole.set(null);
  }

  clearProject() {
    this.projectId.set(null);
    this.projectRole.set(null);
  }

  clearAll() {
    this.userType.set(null);
    this.clearOrganization();
    this.clearProject();
  }

  // Getters
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
}
