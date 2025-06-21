/**
 * Value object representing login credentials.
 * Used when a user attempts to authenticate with the system.
 */
export interface CredentialsVo {
  /**
   * The username provided by the user (can be an email or unique identifier).
   */
  email: string;

  /**
   * The raw or hashed password provided for authentication.
   */
  password: string;
}
