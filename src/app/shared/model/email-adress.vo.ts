export class EmailAddress {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value?.trim().toLowerCase();

    if (!EmailAddress.isValid(normalized)) {
      throw new Error(`Invalid email address: "${value}"`);
    }

    this.value = normalized;
  }

  static isValid(email: string): boolean {
    // RFC 5322-compliant simplified regex
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
