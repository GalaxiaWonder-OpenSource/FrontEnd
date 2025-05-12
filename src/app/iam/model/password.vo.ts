/**
 * Value object representing a user password.
 * Performs basic validation and encapsulation for consistency and safety.
 */
export class Password {
  /**
   * The internal string value of the password.
   * Must be at least 6 characters and contain only visible ASCII characters.
   */
  public readonly value: string;

  /**
   * Creates a new Password instance after validation and trimming.
   *
   * @param value - The raw password string input.
   * @throws Error if the password is invalid.
   */
  constructor(value: string) {
    const trimmed = value.trim();

    if (!Password.isValid(trimmed)) {
      throw new Error(
        'Invalid password: must be at least 6 characters and contain only visible characters.'
      );
    }

    this.value = trimmed;
  }

  /**
   * Validates the given password string.
   * A valid password must be at least 6 characters and contain only visible ASCII characters.
   *
   * @param password - The password string to validate.
   * @returns True if valid, false otherwise.
   */
  static isValid(password: string): boolean {
    return password.length >= 6 && /^[\x20-\x7E]+$/.test(password);
  }

  /**
   * Compares this password with another for equality.
   *
   * @param other - The other Password instance to compare with.
   * @returns True if both passwords have the same value.
   */
  equals(other: Password): boolean {
    return this.value === other.value;
  }

  /**
   * Serializes the password to a JSON-compatible string.
   *
   * @returns The string value of the password.
   */
  toJSON(): string {
    return this.value;
  }
}
