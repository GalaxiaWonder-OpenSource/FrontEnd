/**
 * Value Object for Organization Member ID
 * Represents a unique identifier for an organization member
 */
export class OrganizationMemberId {
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

  equals(other: OrganizationMemberId): boolean {
    return this._value === other?._value;
  }
}