import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as express from "express";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as config from "config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { RedocModule, RedocOptions } from "nestjs-redoc";
import { BadRequestExceptionFilter } from "./bad-request-exception.filter";
import { NotFoundExceptionFilter } from "./not-found-exception.filter";
import { UnauthorizedExceptionFilter } from "./unauthorized-exception.filter";
import { ConflictExcepionFilter } from "./conflict-exception.filter";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing"
import { InternalServerErrorExceptionFilter } from "./internal-server-exception.filter";
import { ForbiddenExceptionFilter } from "./forbidden-resources-exception.filter";
import * as path from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { NotAcceptableExceptionFilter } from "./not-acceptable-exception.filter";
import { timeout } from "rxjs/operators";
import { Integrations } from "@sentry/tracing";

async function bootstrap() {
	const serverConfig = config.get("server");
	const sentryConfig = config.get("Sentry");
	const env = process.env.NODE_ENV
	// let httpsOptions = {
	//   key: fs.readFileSync(path.resolve("src/config/cert/privkey.pem")),
	//   cert: fs.readFileSync(path.resolve("src/config/cert/fullchain.pem")),
	// };

	// if(env == 'prod'){
	//   console.log(env);
	//   httpsOptions = {
	//       key: fs.readFileSync(path.resolve("src/config/cert/live_privkey.pem")),
	//       cert: fs.readFileSync(
	//           path.resolve("src/config/cert/live_fullchain.pem")
	//       ),
	//   };
	// }

	console.log(env);


	const server = express();
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(server),

	);
	//const app = express();
	app.setGlobalPrefix("v1");
	app.useGlobalFilters(new BadRequestExceptionFilter());
	app.useGlobalFilters(new ConflictExcepionFilter());
	app.useGlobalFilters(new NotFoundExceptionFilter());
	app.useGlobalFilters(new UnauthorizedExceptionFilter());
	app.useGlobalFilters(new InternalServerErrorExceptionFilter());
	app.useGlobalFilters(new ForbiddenExceptionFilter());
	app.useGlobalFilters(new NotAcceptableExceptionFilter());
	app.useGlobalPipes(new ValidationPipe());

	const options = new DocumentBuilder()
		.addBearerAuth()
		.setTitle("Lay Trip")
		.setDescription("")
		.setVersion("1.0")

		.build();
	const document = SwaggerModule.createDocument(app, options);


	SwaggerModule.setup("api-docs", app, document);

	/* Added by Chirag Khatri (just to check other theme for OpenApi )*/
	const redocOptions: RedocOptions = {
		title: "Laytrip API Doc",
		logo: {
			// url: 'https://redocly.github.io/redoc/petstore-logo.png',
			backgroundColor: "#F0F0F0",
			altText: "Laytrip Logo",
		},
		sortPropsAlphabetically: true,
		hideDownloadButton: false,
		hideHostname: false,
		hideLoading: false,
	};

	// Instead of using SwaggerModule.setup() you call this module
	await RedocModule.setup("/docs", app, document, redocOptions);

	app.enableCors();

	const port = process.env.PORT || serverConfig.port;
	app.useStaticAssets(path.join(__dirname, "/../assets"));
	// console.log(process.env.PORT)
	let aa:any = await app.init();
	//const router = express.Router();
	Sentry.init({
		dsn: "https://47ecfff0023b486a8d48526ba6dd7b31@o571486.ingest.sentry.io/5872477", //Add your DSN
		environment: "Dev",
		integrations: [
			// enable HTTP calls tracing
			new Sentry.Integrations.Http({ tracing: true }),
			new Sentry.Integrations.Console(),
			new Sentry.Integrations.OnUncaughtException(),
			// enable Express.js middleware tracing
			new Integrations.Express(),
			new Tracing.Integrations.Express({
	            methods:['all','get']
	        }),
			new Tracing.Integrations.Express(aa)
		],
		tracesSampleRate: 1.0,
	});
	// Sentry.init({
	//     dsn: process.env.DSN || sentryConfig.DSN,
	//     integrations: [
	//         // enable HTTP calls tracing
	//         new Sentry.Integrations.Http({ tracing: true }),
	//         // enable Express.js middleware tracing
	//         new Tracing.Integrations.Express({
	//             methods:['all','get']
	//         }),
	//     ],

	//     // We recommend adjusting this value in production, or using tracesSampler
	//     // for finer control
	//     tracesSampleRate: 1.0,
	// });
	app.use(Sentry.Handlers.requestHandler());
	// TracingHandler creates a trace for every incoming request
	app.use(Sentry.Handlers.tracingHandler());

	app.use(Sentry.Handlers.errorHandler());
	server.use(timeout(3600));
	http.createServer(server).listen(port);
	//https.createServer(httpsOptions, server).listen(4047);
}

bootstrap();
