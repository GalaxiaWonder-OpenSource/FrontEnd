/**
 * Enum representing the role assigned to a user account.
 * Used to control access and permissions based on user type.
 *
 * @enum {string}
 */
export enum UserRole {
  /**
   * Role assigned to a standard end-user or client.
   */
  CLIENT_USER = 'CLIENT_USER',

  /**
   * Role assigned to a member of an organization with administrative or collaborative privileges.
   */
  ORGANIZATION_USER = 'ORGANIZATION_USER'
}
