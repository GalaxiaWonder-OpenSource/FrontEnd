/**
 * Enum representing the role assigned to a user account.
 * Used to control access and permissions based on user type.
 *
 * @enum {string}
 */
export enum UserType {
  /**
   * Role assigned to a standard end-user or client.
   */
  TYPE_CLIENT = 'TYPE_CLIENT',

  /**
   * Role assigned to a member of an organization with administrative or collaborative privileges.
   */
  TYPE_WORKER = 'TYPE_WORKER'
}
