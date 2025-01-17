/**
 * Oversigt API
 * This API provides access to all public operations of Oversigt.
 *
 * OpenAPI spec version: 1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface ErrorResponse { 
    /**
     * The error message with which the API call failed
     */
    message: string;
    uuid?: string;
    /**
     * Details to the error message
     */
    readonly errors?: Array<string>;
}
