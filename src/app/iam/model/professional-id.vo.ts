import { ProfessionalIdType } from './professional-id-type.vo';

/**
 * Value object representing a professional registration ID.
 * Includes both the ID value and its associated type (e.g., CIP or CAP).
 */
export class ProfessionalId {
  /**
   * The normalized professional ID value (e.g., '123456').
   */
  public readonly value: string;

  /**
   * The type of professional ID (e.g., CIP, CAP).
   */
  public readonly type: ProfessionalIdType;

  /**
   * Creates a new ProfessionalId instance after validating the value and type.
   *
   * @param value - The raw ID string provided by the user.
   * @param type - The type of the professional ID (enum).
   * @throws Error if the value is not valid or the type is unknown.
   */
  constructor(value: string, type: ProfessionalIdType) {
    const normalized = value.trim().toUpperCase();

    if (!ProfessionalId.isValid(normalized)) {
      throw new Error(`Invalid Professional ID value: "${value}"`);
    }

    if (!Object.values(ProfessionalIdType).includes(type)) {
      throw new Error(`Invalid Professional ID type: "${type}"`);
    }

    this.value = normalized;
    this.type = type;
  }

  /**
   * Validates the format of the professional ID value.
   * Must be at least 6 alphanumeric uppercase characters.
   *
   * @param id - The ID string to validate.
   * @returns True if the ID is valid, false otherwise.
   */
  static isValid(id: string): boolean {
    return /^[A-Z0-9]{6,}$/.test(id.trim());
  }

  /**
   * Compares this ProfessionalId with another for equality.
   *
   * @param other - The other ProfessionalId instance to compare.
   * @returns True if both value and type are equal.
   */
  equals(other: ProfessionalId): boolean {
    return this.value === other.value && this.type === other.type;
  }

  /**
   * Returns a string representation combining type and value.
   *
   * @returns A string like 'CIP-123456'.
   */
  toString(): string {
    return `${this.type}-${this.value}`;
  }

  /**
   * Serializes the ProfessionalId to a JSON-compatible object.
   *
   * @returns An object with `value` and `type` fields.
   */
  toJSON() {
    return {
      value: this.value,
      type: this.type
    };
  }
}
