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
import { WidgetDetails } from '../model/widgetDetails';
import { WidgetInfo } from '../model/widgetInfo';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class DashboardWidgetService {

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
     * Create widget
     * 
     * @param dashboardId 
     * @param eventSource 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createWidget(dashboardId: string, eventSource: string, observe?: 'body', reportProgress?: boolean): Observable<WidgetDetails>;
    public createWidget(dashboardId: string, eventSource: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<WidgetDetails>>;
    public createWidget(dashboardId: string, eventSource: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<WidgetDetails>>;
    public createWidget(dashboardId: string, eventSource: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (dashboardId === null || dashboardId === undefined) {
            throw new Error('Required parameter dashboardId was null or undefined when calling createWidget.');
        }

        if (eventSource === null || eventSource === undefined) {
            throw new Error('Required parameter eventSource was null or undefined when calling createWidget.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (eventSource !== undefined && eventSource !== null) {
            queryParameters = queryParameters.set('eventSource', <any>eventSource);
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

        return this.httpClient.post<WidgetDetails>(`${this.basePath}/dashboards/${encodeURIComponent(String(dashboardId))}/widgets`,
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
     * Delete widget
     * 
     * @param dashboardId 
     * @param id 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteWidget(dashboardId: string, id: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public deleteWidget(dashboardId: string, id: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public deleteWidget(dashboardId: string, id: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public deleteWidget(dashboardId: string, id: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (dashboardId === null || dashboardId === undefined) {
            throw new Error('Required parameter dashboardId was null or undefined when calling deleteWidget.');
        }

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteWidget.');
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

        return this.httpClient.delete<any>(`${this.basePath}/dashboards/${encodeURIComponent(String(dashboardId))}/widgets/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * List widgets of a dashboard
     * 
     * @param dashboardId 
     * @param containing Only show widgets containing this text
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listWidgets(dashboardId: string, containing?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<WidgetInfo>>;
    public listWidgets(dashboardId: string, containing?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<WidgetInfo>>>;
    public listWidgets(dashboardId: string, containing?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<WidgetInfo>>>;
    public listWidgets(dashboardId: string, containing?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (dashboardId === null || dashboardId === undefined) {
            throw new Error('Required parameter dashboardId was null or undefined when calling listWidgets.');
        }


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

        return this.httpClient.get<Array<WidgetInfo>>(`${this.basePath}/dashboards/${encodeURIComponent(String(dashboardId))}/widgets`,
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
     * Read widget
     * 
     * @param dashboardId 
     * @param id 
     * @param showAllProperties false to show only properties defined for this specific widget. true to additionally show all properties inherited from the underlaying event source.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public readWidget(dashboardId: string, id: number, showAllProperties?: boolean, observe?: 'body', reportProgress?: boolean): Observable<WidgetDetails>;
    public readWidget(dashboardId: string, id: number, showAllProperties?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<WidgetDetails>>;
    public readWidget(dashboardId: string, id: number, showAllProperties?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<WidgetDetails>>;
    public readWidget(dashboardId: string, id: number, showAllProperties?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (dashboardId === null || dashboardId === undefined) {
            throw new Error('Required parameter dashboardId was null or undefined when calling readWidget.');
        }

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling readWidget.');
        }


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (showAllProperties !== undefined && showAllProperties !== null) {
            queryParameters = queryParameters.set('showAllProperties', <any>showAllProperties);
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

        return this.httpClient.get<WidgetDetails>(`${this.basePath}/dashboards/${encodeURIComponent(String(dashboardId))}/widgets/${encodeURIComponent(String(id))}`,
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
     * Update widget
     * 
     * @param dashboardId 
     * @param id 
     * @param body 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateWidget(dashboardId: string, id: number, body?: WidgetDetails, observe?: 'body', reportProgress?: boolean): Observable<WidgetDetails>;
    public updateWidget(dashboardId: string, id: number, body?: WidgetDetails, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<WidgetDetails>>;
    public updateWidget(dashboardId: string, id: number, body?: WidgetDetails, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<WidgetDetails>>;
    public updateWidget(dashboardId: string, id: number, body?: WidgetDetails, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (dashboardId === null || dashboardId === undefined) {
            throw new Error('Required parameter dashboardId was null or undefined when calling updateWidget.');
        }

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling updateWidget.');
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

        return this.httpClient.put<WidgetDetails>(`${this.basePath}/dashboards/${encodeURIComponent(String(dashboardId))}/widgets/${encodeURIComponent(String(id))}`,
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
