import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointConfig } from '../model/endpoint-config.vo';
import { HttpMethod } from '../model/http-method.vo';

/**
 * Extracts the underlying value from an object.
 *
 * This utility supports value objects commonly used in DDD by checking for:
 * - a `.value` property (e.g., UserId.value)
 * - a `.toJSON()` method
 *
 * If none of those exist, it returns the input as-is.
 *
 * @param val - The input value or object to extract from
 * @returns The extracted primitive value or the original input
 */
function extractParamValue(val: any): any {
  if (val === null || val === undefined) return val;

  if (typeof val === 'object') {
    // Debug para ver qué tipo de objeto es
    console.log(`[ParamExtract] Extracting value from:`, val);
    
    if ('value' in val) {
      console.log(`[ParamExtract] Found 'value' property:`, val.value);
      return val.value;
    }
    if (typeof val.toJSON === 'function') {
      const jsonValue = val.toJSON();
      console.log(`[ParamExtract] Using toJSON() method:`, jsonValue);
      return jsonValue;
    }
  }

  return val;
}

/**
 * Replaces dynamic path parameters in a URL with actual values.
 *
 * Matches tokens like `:id` or `:userId` in the URL and replaces them with
 * the corresponding values from the `params` object. Supports value objects
 * by extracting their `.value` or `.toJSON()` if available.
 *
 * @example
 * // Basic substitution
 * replacePathParams('/users/:id', { id: 123 });
 * // → '/users/123'
 *
 * @param url - The URL template containing path parameters
 * @param params - An object containing key-value pairs for substitution
 * @returns A URL with all dynamic parameters replaced
 */
function replacePathParams(url: string, params: Record<string, any>): string {
  console.log(`[PathReplace] Input URL: ${url}, Params:`, params);
  
  const result = url.replace(/:([a-zA-Z]+)/g, (match, key) => {
    console.log(`[PathReplace] Replacing token :${key}`);
    
    if (!params || !(key in params)) {
      console.warn(`[PathReplace] WARNING: No param value found for :${key}`);
      return match; // Devolvemos el token original si no hay valor
    }
    
    const val = extractParamValue(params[key]);
    console.log(`[PathReplace] Extracted value for ${key}:`, val);
    
    if (val === undefined || val === null) {
      console.warn(`[PathReplace] WARNING: Param value for :${key} is undefined/null`);
      return match;
    }
    
    const encoded = encodeURIComponent(String(val));
    console.log(`[PathReplace] Encoded value: ${encoded}`);
    return encoded;
  });
  
  console.log(`[PathReplace] Final URL: ${result}`);
  return result;
}

/**
 * Serializes an object by extracting primitive values from its properties.
 *
 * This function is useful for preparing request bodies before sending them
 * to an API. It supports value objects by automatically extracting their
 * `.value` or `.toJSON()` representation using `extractParamValue`.
 *
 * @param data - The input object to serialize, possibly containing nested value objects
 * @returns A plain object with extracted values, or the input itself if not serializable
 *
 * @example
 * serializeData({ id: new UserId('abc123'), name: 'Tralalero' });
 * // → { id: 'abc123', name: 'Tralalero' }
 */
function serializeData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const result: any = {};
  for (const key of Object.keys(data)) {
    result[key] = extractParamValue(data[key]);
  }
  return result;
}

/**
 * Dynamically generates a service with HTTP methods based on endpoint configurations.
 *
 * Each method in the resulting service corresponds to an `EndpointConfig`,
 * automatically handling value object serialization and dynamic path parameter replacement.
 * Supports standard HTTP verbs: GET, POST, PUT, PATCH, DELETE.
 *
 * @template T - The expected output type of the endpoint methods
 *
 * @param configs - An array of endpoint configurations defining the method, name, and URL
 * @returns An object with named methods that perform HTTP requests using Angular's HttpClient
 *
 * @example
 * const userService = createDynamicService<User>({
 *   name: 'getById',
 *   method: HttpMethod.GET,
 *   url: 'http://localhost:3000/users/:id'
 * });
 *
 * userService.getById({}, { id: 'abc123' }).subscribe(user => console.log(user));
 */
export function createDynamicService<T>(configs: EndpointConfig[]): Record<string, Function> {
  const http = inject(HttpClient);
  const httpOptions = { headers: { 'Content-Type': 'application/json' } };
  const service: Record<string, Function> = {};

  for (const cfg of configs) {
    service[cfg.name] = (data: any = {}, params: any = {}): Observable<T> => {
      // Procesamiento especial para el parámetro 'id' si existe
      if (params && params.id) {
        // Asegurarse de obtener el valor simple del ID en caso de que sea un objeto
        if (typeof params.id === 'object') {
          if (params.id.value !== undefined) {
            params.id = params.id.value;
          } else if (typeof params.id.toJSON === 'function') {
            params.id = params.id.toJSON();
          } else if (typeof params.id.toString === 'function') {
            params.id = params.id.toString();
          }
        }
      }
      
      const url = replacePathParams(cfg.url, params);
      const body = serializeData(data);
      
      // Debug log para ver qué URL se está generando
      console.log(`[API DEBUG] ${cfg.name} - Original URL: ${cfg.url}, Params:`, params, `Final URL: ${url}`);
      
      switch (cfg.method) {
        case HttpMethod.GET:
          const queryParams = new URLSearchParams(serializeData(params)).toString();
          const fullUrl = queryParams ? `${url}?${queryParams}` : url;
          return http.get<T>(fullUrl, httpOptions);
        case HttpMethod.POST:
          return http.post<T>(url, body, httpOptions);
        case HttpMethod.PUT:
          return http.put<T>(url, body, httpOptions);
        case HttpMethod.PATCH:
          return http.patch<T>(url, body, httpOptions);
        case HttpMethod.DELETE:
          return http.delete<T>(url, httpOptions);
        default:
          throw new Error(`Unsupported HTTP method: ${cfg.method}`);
      }
    };
  }

  return service;
}
