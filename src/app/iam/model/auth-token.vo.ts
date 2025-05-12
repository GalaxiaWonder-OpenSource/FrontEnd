/**
 * Value object representing an authentication token returned after login.
 * Contains metadata useful for validating and managing user sessions.
 */
export interface AuthTokenVo {
  /**
   * The JWT or session token used to authenticate subsequent requests.
   */
  token: string;

  /**
   * ISO 8601 timestamp indicating when the token was issued.
   */
  issuedAt: string;

  /**
   * ISO 8601 timestamp indicating when the token will expire.
   */
  expiresAt: string;

  /**
   * The unique identifier of the authenticated user.
   */
  userId: string;
}
