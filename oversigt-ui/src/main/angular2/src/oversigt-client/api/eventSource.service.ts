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
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs/Observable';

import { ErrorResponse } from '../model/errorResponse';
import { EventSourceDescriptor } from '../model/eventSourceDescriptor';
import { EventSourceInfo } from '../model/eventSourceInfo';
import { EventSourceInstanceDetails } from '../model/eventSourceInstanceDetails';
import { EventSourceInstanceInfo } from '../model/eventSourceInstanceInfo';
import { EventSourceInstanceState } from '../model/eventSourceInstanceState';
import { FullEventSourceInstanceInfo } from '../model/fullEventSourceInstanceInfo';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class EventSourceService {

    protected basePath = 'http://localhost/api/v1';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
            this.basePath = basePath || configuration.basePath || this.basePath;
        }
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (const consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }


    /**
     * Create event source instance
     * 
     * @param key The key of the event source descriptor to be used
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createInstance(key?: string, observe?: 'body', reportProgress?: boolean): Observable<EventSourceInstanceDetails>;
    public createInstance(key?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<EventSourceInstanceDetails>>;
    public createInstance(key?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<EventSourceInstanceDetails>>;
    public createInstance(key?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (key !== undefined && key !== null) {
            queryParameters = queryParameters.set('key', <any>key);
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.post<EventSourceInstanceDetails>(`${this.basePath}/event-source/instances`,
            null,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Delete event source instance
     * 
     * @param id 
     * @param force true to also remove all widgets using this event source
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteInstance(id: string, force?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public deleteInstance(id: string, force?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public deleteInstance(id: string, force?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public deleteInstance(id: string, force?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteInstance.');
        }


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (force !== undefined && force !== null) {
            queryParameters = queryParameters.set('force', <any>force);
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.delete<any>(`${this.basePath}/event-source/instances/${encodeURIComponent(String(id))}`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Read event source description
     * 
     * @param key 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getEventSourceDetails(key: string, observe?: 'body', reportProgress?: boolean): Observable<EventSourceDescriptor>;
    public getEventSourceDetails(key: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<EventSourceDescriptor>>;
    public getEventSourceDetails(key: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<EventSourceDescriptor>>;
    public getEventSourceDetails(key: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (key === null || key === undefined) {
            throw new Error('Required parameter key was null or undefined when calling getEventSourceDetails.');
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.get<EventSourceDescriptor>(`${this.basePath}/event-source/descriptions/${encodeURIComponent(String(key))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Read an event source instance&#39;s current state
     * 
     * @param id 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public isInstanceRunning(id: string, observe?: 'body', reportProgress?: boolean): Observable<EventSourceInstanceState>;
    public isInstanceRunning(id: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<EventSourceInstanceState>>;
    public isInstanceRunning(id: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<EventSourceInstanceState>>;
    public isInstanceRunning(id: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling isInstanceRunning.');
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.get<EventSourceInstanceState>(`${this.basePath}/event-source/state/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * List available event sources
     * 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listAvailableEventSources(observe?: 'body', reportProgress?: boolean): Observable<Array<EventSourceInfo>>;
    public listAvailableEventSources(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<EventSourceInfo>>>;
    public listAvailableEventSources(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<EventSourceInfo>>>;
    public listAvailableEventSources(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.get<Array<EventSourceInfo>>(`${this.basePath}/event-source/descriptions`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * List existing event source instances
     * 
     * @param containing Filter to reduce the number of listed instances
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listInstances(containing?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<EventSourceInstanceInfo>>;
    public listInstances(containing?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<EventSourceInstanceInfo>>>;
    public listInstances(containing?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<EventSourceInstanceInfo>>>;
    public listInstances(containing?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (containing !== undefined && containing !== null) {
            queryParameters = queryParameters.set('containing', <any>containing);
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.get<Array<EventSourceInstanceInfo>>(`${this.basePath}/event-source/instances`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Read event source instance
     * 
     * @param id 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public readInstance(id: string, observe?: 'body', reportProgress?: boolean): Observable<FullEventSourceInstanceInfo>;
    public readInstance(id: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<FullEventSourceInstanceInfo>>;
    public readInstance(id: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<FullEventSourceInstanceInfo>>;
    public readInstance(id: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling readInstance.');
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.get<FullEventSourceInstanceInfo>(`${this.basePath}/event-source/instances/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Read event source instance usage
     * 
     * @param id 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public readInstanceUsage(id: string, observe?: 'body', reportProgress?: boolean): Observable<Array<string>>;
    public readInstanceUsage(id: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<string>>>;
    public readInstanceUsage(id: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<string>>>;
    public readInstanceUsage(id: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling readInstanceUsage.');
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.get<Array<string>>(`${this.basePath}/event-source/instances/${encodeURIComponent(String(id))}/usage`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Start or stop an event source instance
     * 
     * @param id 
     * @param running Whether the event source instance shall be running or not
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public setInstanceRunning(id: string, running: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public setInstanceRunning(id: string, running: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public setInstanceRunning(id: string, running: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public setInstanceRunning(id: string, running: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling setInstanceRunning.');
        }

        if (running === null || running === undefined) {
            throw new Error('Required parameter running was null or undefined when calling setInstanceRunning.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (running !== undefined && running !== null) {
            queryParameters = queryParameters.set('running', <any>running);
        }

        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.post<any>(`${this.basePath}/event-source/state/${encodeURIComponent(String(id))}`,
            null,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Update event source instance
     * 
     * @param id 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateInstance(id: string, body?: EventSourceInstanceDetails, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public updateInstance(id: string, body?: EventSourceInstanceDetails, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public updateInstance(id: string, body?: EventSourceInstanceDetails, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public updateInstance(id: string, body?: EventSourceInstanceDetails, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling updateInstance.');
        }


        let headers = this.defaultHeaders;

        // authentication (JsonWebToken) required
        if (this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.put<any>(`${this.basePath}/event-source/instances/${encodeURIComponent(String(id))}`,
            body,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
