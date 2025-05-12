/**
 * Enum representing the status of a user account.
 * Used to indicate whether the account is currently active, inactive, or suspended.
 *
 * @enum {string}
 */
export enum AccountStatus {
  /**
   * The account is active and fully functional.
   */
  ACTIVE = 'ACTIVE',

  /**
   * The account is inactive and may require reactivation.
   */
  INACTIVE = 'INACTIVE',

  /**
   * The account has been suspended due to administrative or policy reasons.
   */
  SUSPENDED = 'SUSPENDED'
}
