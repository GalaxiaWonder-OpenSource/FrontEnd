/**
 * Enum representing the status of a registration request.
 * Indicates whether the request is pending confirmation or has already resulted in an account.
 *
 * @enum {string}
 */
export enum RegistrationRequestStatus {
  /**
   * The registration has been submitted but not yet completed or confirmed.
   */
  CONFIRMATION_PENDING = 'CONFIRMATION_PENDING',

  /**
   * The user has been successfully registered and the request is complete.
   */
  REGISTERED = 'REGISTERED'
}
