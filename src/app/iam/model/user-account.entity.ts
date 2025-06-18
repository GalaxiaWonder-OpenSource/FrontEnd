import { UserType } from './user-type.vo';
import { AccountStatus } from './account-status.vo';

/**
 * Entity representing a user account in the system.
 * Tied to a specific person and encapsulates credentials, role, and status.
 */
export class UserAccount {
  /** Unique identifier for the user account. */
  public readonly id: number;

  /** Optional reference to the person this account belongs to. */
  public readonly personId: number;

  /** Username used for login and identification. */
  public username: string;

  /** Password used for authentication. */
  public password: string;

  /** Role assigned to the user (e.g., client, organization user). */
  public role: UserType;

  /**
   * Constructs a new UserAccount instance.
   *
   * @param id - Optional unique account identifier (defaults to new ID).
   * @param username - Username (value object).
   * @param password - Password (value object).
   * @param role - Optional user role (default: CLIENT_USER).
   * @param status - Optional account status (default: ACTIVE).
   * @param personId - Optional associated person ID.
   *
   * @throws Error if required fields are missing or contain invalid values.
   */
  constructor({
                id,
                username,
                password,
                role,
                personId
              }: {
    id: number;
    username: string;
    password: string;
    role: UserType;
    personId: number;
  }) {
    if (!username) {
      throw new Error('Username is required.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    if (!role || !Object.values(UserType).includes(role)) {
      throw new Error(`Invalid or missing user role: ${role}`);
    }

    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.personId = personId;
  }

  /**
   * Serializes the user account to a JSON-compatible object.
   *
   * @returns An object with account data for persistence or transmission.
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      password: this.password,
      role: this.role,
      personId: this.personId ?? null
    };
  }
}
