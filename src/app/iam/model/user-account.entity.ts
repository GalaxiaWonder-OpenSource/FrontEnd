import { UserRole } from './user-role.vo';
import { AccountStatus } from './account-status.vo';
import { UserAccountId } from '../../shared/model/user-account-id.vo';
import { PersonId } from '../../shared/model/person-id.vo';
import { Username } from './username.vo';
import { Password } from './password.vo';

/**
 * Entity representing a user account in the system.
 * Tied to a specific person and encapsulates credentials, role, and status.
 */
export class UserAccount {
  /** Unique identifier for the user account. */
  public readonly id: UserAccountId;

  /** Optional reference to the person this account belongs to. */
  public readonly personId?: PersonId;

  /** Username used for login and identification. */
  public username: Username;

  /** Password used for authentication. */
  public password: Password;

  /** Role assigned to the user (e.g., client, organization user). */
  public role: UserRole;

  /** Current status of the account (e.g., active, suspended). */
  public status: AccountStatus;

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
                id = new UserAccountId(),
                username,
                password,
                role = UserRole.CLIENT_USER,
                status = AccountStatus.ACTIVE,
                personId
              }: {
    id?: UserAccountId;
    username: Username;
    password: Password;
    role?: UserRole;
    status?: AccountStatus;
    personId?: PersonId;
  }) {
    if (!username) {
      throw new Error('Username is required.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new Error(`Invalid user role: ${role}`);
    }

    if (!Object.values(AccountStatus).includes(status)) {
      throw new Error(`Invalid account status: ${status}`);
    }

    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.status = status;
    this.personId = personId;
  }

  /**
   * Checks whether the user account is currently active.
   *
   * @returns True if the account status is ACTIVE.
   */
  isActive(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  /**
   * Sets the account status to SUSPENDED.
   */
  suspend() {
    this.status = AccountStatus.SUSPENDED;
  }

  /**
   * Sets the account status to ACTIVE.
   */
  activate() {
    this.status = AccountStatus.ACTIVE;
  }

  /**
   * Serializes the user account to a JSON-compatible object.
   *
   * @returns An object with account data for persistence or transmission.
   */
  toJSON() {
    return {
      id: this.id.value,
      username: this.username.value,
      password: this.password.value,
      role: this.role,
      status: this.status,
      personId: this.personId?.value ?? null
    };
  }
}
