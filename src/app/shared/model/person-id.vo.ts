/**
 * Value Object for Person ID
 * Represents a unique identifier for a person
 */
export class PersonId {
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

  equals(other: PersonId): boolean {
    return this._value === other?._value;
  }
}