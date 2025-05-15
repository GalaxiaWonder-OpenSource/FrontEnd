/**
 * Value object representing a username used for authentication and identification.
 * Usernames must be lowercase, alphanumeric, and no longer than 12 characters.
 */
export class Username {
  /**
   * The normalized username value (lowercase, trimmed).
   */
  public readonly value: string;

  /**
   * Constructs a new Username instance after validation and normalization.
   *
   * @param value - Raw input string representing a username.
   * @throws Error if the username is invalid.
   */
  constructor(value: string) {
    const normalized = value.trim().toLowerCase();

    if (!Username.isValid(normalized)) {
      throw new Error(
        'Invalid username: must be lowercase, max 12 characters, and contain only letters and numbers.'
      );
    }

    this.value = normalized;
  }

  /**
   * Validates the given username string.
   * A valid username contains only lowercase letters and digits, with a max length of 12 characters.
   *
   * @param username - The username string to validate.
   * @returns True if the username is valid, false otherwise.
   */
  static isValid(username: string): boolean {
    const pattern = /^[a-z0-9]{1,12}$/;
    return pattern.test(username.trim());
  }

  /**
   * Compares this username with another for equality.
   *
   * @param other - Another Username instance to compare.
   * @returns True if both usernames are equal.
   */
  equals(other: Username): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the username as a string.
   *
   * @returns The string representation of the username.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Serializes the username to a JSON-compatible string.
   *
   * @returns The username as a plain string.
   */
  toJSON(): string {
    return this.value;
  }
}
