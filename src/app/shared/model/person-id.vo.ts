export class PersonId {
  public readonly value: string;

  constructor(value?: string) {
    this.value = (value && value.trim() !== '') ? value : crypto.randomUUID();
  }

  toString(): string {
    return this.value;
  }

  equals(other: PersonId): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }
}
