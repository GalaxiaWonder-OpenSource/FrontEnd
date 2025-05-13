/**
 * Value Object representing a Peruvian RUC (Registro Único de Contribuyentes).
 */
export class Ruc {
  public readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim();

    if (!Ruc.isValid(trimmed)) {
      throw new Error(`Invalid RUC: ${value}`);
    }

    this.value = trimmed;
  }

  /**
   * Validates if a given string is a valid Peruvian RUC.
   *
   * @param ruc - The RUC string to validate.
   * @returns True if valid, false otherwise.
   */
  static isValid(ruc: string): boolean {
    const rucRegex = /^[1|2]\d{10}$/;
    return rucRegex.test(ruc);
  }

  /**
   * Compares two RUCs for equality.
   * @param other - Another Ruc instance.
   * @returns True if both are equal.
   */
  equals(other: Ruc): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
