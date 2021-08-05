import {
    ExecutionContext,
    Injectable,
    NestInterceptor,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import * as Sentry from '@sentry/minimal';
var Raven = require("raven");
Raven.config("https://c2308300166c4e4cacd8f159cbfb438a@o399378.ingest.sentry.io/5892761", {
  autoBreadcrumbs: true,
}).install();
  
  @Injectable()
  export class SentryInterceptor implements NestInterceptor {
  
    intercept( context: ExecutionContext, next: CallHandler): Observable<any> {
      

      return next
        .handle()
        .pipe(
          tap(null, (exception) => {

            

            Raven.captureException(exception, {
              user: context.switchToHttp().getRequest().user, // User-related info
              req: context.switchToHttp().getRequest().url, // Request object from HTTP web server (handled by Raven Express)
              body: { body: context.switchToHttp().getRequest().url, method: context.switchToHttp().getRequest().method }, // Tags // Any other data you'd specify with setContext
              level: 'error' // Event level
            });
            Sentry.captureException(exception);
          }),
        );
    }
  
  }