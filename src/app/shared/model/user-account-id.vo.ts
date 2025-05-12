export class UserAccountId {
  public readonly value: string;

  constructor(value?: string) {
    this.value = (value && value.trim() !== '') ? value : crypto.randomUUID();
  }

  toString() {
    return this.value;
  }

  equals(other: UserAccountId): boolean {
    return this.value === other.value;
  }
}
