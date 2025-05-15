/**
 * Value object representing a phone number.
 * Ensures a normalized and validated format for consistent usage.
 */
export class PhoneNumber {
  /**
   * The normalized phone number value (digits only, optional '+' prefix).
   */
  public readonly value: string;

  /**
   * Constructs a new PhoneNumber instance after validation and normalization.
   *
   * @param value - Raw input string representing a phone number.
   * @throws Error if the phone number is not valid.
   */
  constructor(value: string) {
    const normalized = value.replace(/\s+/g, '').trim();

    if (!PhoneNumber.isValid(normalized)) {
      throw new Error(`Invalid phone number: "${value}"`);
    }

    this.value = normalized;
  }

  /**
   * Checks if the provided phone string matches the expected format.
   * A valid number contains only digits, with optional '+' prefix, and is 7–15 characters long.
   *
   * @param phone - The phone number string to validate.
   * @returns True if valid, false otherwise.
   */
  static isValid(phone: string): boolean {
    const phoneRegex = /^\+?\d{7,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Compares this phone number with another for equality.
   *
   * @param other - The other PhoneNumber instance to compare.
   * @returns True if both numbers have the same value.
   */
  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the string representation of the phone number.
   *
   * @returns The phone number as a string.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Serializes the phone number for JSON output.
   *
   * @returns The phone number as a string.
   */
  toJSON(): string {
    return this.value;
  }
}
