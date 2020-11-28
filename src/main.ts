import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as express from "express";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as config from "config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { BadRequestExceptionFilter } from "./bad-request-exception.filter";
import { NotFoundExceptionFilter } from "./not-found-exception.filter";
import { UnauthorizedExceptionFilter } from "./unauthorized-exception.filter";
import { ConflictExcepionFilter } from "./conflict-exception.filter";
import * as Sentry from "@sentry/node";
import { InternalServerErrorExceptionFilter } from "./internal-server-exception.filter";
import { ForbiddenExceptionFilter } from "./forbidden-resources-exception.filter";
import * as path from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { NotAcceptableExceptionFilter } from "./not-acceptable-exception.filter";
import { timeout } from "rxjs/operators";

async function bootstrap() {
	const serverConfig = config.get("server");
	const sentryConfig = config.get("Sentry");
	let httpsOptions = {
		key: fs.readFileSync(path.resolve("src/config/cert/privkey.pem")),
		cert: fs.readFileSync(path.resolve("src/config/cert/fullchain.pem")),
	};
	

	const server = express();
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(server)
	);

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
	Sentry.init({
		dsn: process.env.DSN || sentryConfig.DSN,
	});
	SwaggerModule.setup("api-docs", app, document);
	app.enableCors();

	const port = process.env.PORT || serverConfig.port;
	app.useStaticAssets(path.join(__dirname, "/../assets"));
	console.log(process.env.PORT)
	await app.init();
	
	server.use(timeout(3600))
	http.createServer(server).listen(port);
	https.createServer(httpsOptions, server).listen(4047);
	
}	

bootstrap();
