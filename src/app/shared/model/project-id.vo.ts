/**
 * Value Object for Project ID
 * Represents a unique identifier for a project
 */
export class ProjectId {
  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }

  equals(other: ProjectId): boolean {
    return this._value === other?._value;
  }
}
