import { HttpMethod } from './http-method.vo';
import { environment } from '../../../environments/environment';

/**
 * Default base URL derived from environment configuration.
 */
const defaultBaseUrl = `${environment.propgmsApiBaseUrl}`;

/**
 * Defines the configuration for a dynamic API endpoint.
 *
 * This interface is used by the `createDynamicService` factory
 * to generate callable methods for HTTP operations.
 *
 * @template TInput - The expected input (body) type for the endpoint
 * @template TOutput - The expected output (response) type from the endpoint
 */
export interface EndpointConfig<TInput = any, TOutput = any> {
  /** Unique name used as the method key in the generated service */
  name: string;

  /** The HTTP method to be used for the request (e.g., GET, POST) */
  method: HttpMethod;

  /** The full URL for the endpoint, including any dynamic path params (e.g., '/users/:id') */
  url: string;
}

/**
 * Factory function that builds a complete endpoint configuration.
 *
 * If a `url` is not explicitly provided, it is constructed from:
 * - `baseUrl` (default: value from environment)
 * - `resource` (e.g., 'users')
 * - `pathSuffix` (e.g., '/:id', '/status')
 *
 * This utility helps reduce repetition and enforces consistent endpoint structures
 * for use in dynamically generated services.
 *
 * @template TInput - Type of the expected input payload (request body)
 * @template TOutput - Type of the expected output (API response)
 *
 * @param config - Configuration object containing the name and HTTP method. URL is optional if `resource` is provided.
 * @param baseUrl - Optional base URL for the API. Defaults to the environment base URL.
 * @param resource - Optional resource segment to append to the base URL (e.g., 'users')
 * @param pathSuffix - Optional suffix to append after the resource (e.g., '/:id')
 * @returns A complete and ready-to-use `EndpointConfig` object
 *
 * @example
 * createEndpointConfig({ name: 'getById', method: HttpMethod.GET }, undefined, 'users', '/:id');
 * // → { name: 'getById', method: 'GET', url: 'http://localhost:3000/users/:id' }
 */
export function createEndpointConfig<TInput = any, TOutput = any>(
  config: Omit<EndpointConfig<TInput, TOutput>, 'url'> & Partial<Pick<EndpointConfig<TInput, TOutput>, 'url'>>,
  baseUrl: string = defaultBaseUrl,
  resource?: string,
  pathSuffix: string = ''
): EndpointConfig<TInput, TOutput> {
  if (!config.name) {
    throw new Error('EndpointConfig "name" is required');
  }

  if (!config.method) {
    throw new Error(`EndpointConfig "method" is required for endpoint "${config.name}"`);
  }

  const url = config.url ?? (
    resource
      ? `${baseUrl.replace(/\/$/, '')}/${resource.replace(/^\//, '')}${pathSuffix}`
      : `${baseUrl}${pathSuffix}`
  );

  return {
    name: config.name,
    method: config.method,
    url
  };
}

