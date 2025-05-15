export class ProjectTeamMemberId {
  public readonly value: string;

  constructor(value?: string) {
    this.value = (value && value.trim() !== '') ? value : crypto.randomUUID();
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProjectTeamMemberId): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }
}
