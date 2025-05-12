export class ChangeProcessId {
  public readonly value: string;

  constructor(value?: string) {
    this.value = (value && value.trim() !== '') ? value : crypto.randomUUID();
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
