/**
 * Enumeration of supported HTTP methods for endpoint configurations.
 *
 * This enum is used to specify the HTTP verb to be used when generating
 * dynamic service methods.
 */
export enum HttpMethod {
  /** HTTP GET method - used for data retrieval */
  GET = 'GET',

  /** HTTP POST method - used for creating new resources */
  POST = 'POST',

  /** HTTP PUT method - used for replacing existing resources */
  PUT = 'PUT',

  /** HTTP PATCH method - used for partial updates to a resource */
  PATCH = 'PATCH',

  /** HTTP DELETE method - used for deleting a resource */
  DELETE = 'DELETE'
}
