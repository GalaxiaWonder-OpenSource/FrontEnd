/**
 * Value Object for Organization ID
 * Represents a unique identifier for an organization
 */
export class OrganizationId {
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

  equals(other: OrganizationId): boolean {
    return this._value === other?._value;
  }
}