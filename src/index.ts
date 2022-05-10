import fastify from "fastify";
import fastifyCors from "fastify-cors";
import { Route } from "./types/common";
import * as env from 'env-var';
import dotenv from 'dotenv'

// Servies
import { initDocumentation } from "./services/Documentation";
import { initNews } from "./services/News";
import { initRss } from "./services/Rss";
import { initPostgres } from "./services/Postgres";

// Routes
import { NewsRoutes } from "./routes/News";
import { initExampleRoutes } from "./routes/Example";
import { RssRoutes } from "./routes/Rss";
import { TypeAheadRoutes } from './routes/TypeAhead';


//Enviromental variables:
//An EnvVarError will be thrown for validation errors
dotenv.config()
const API_VERSION = "v0.1.0";
const PORT: number = env.get('PORT').required().asIntPositive();
const ENV: String = env.get('ENV').required().asString();

/**
 * Main fastify instance
 *
 * Initialize the services, pass it to the routes and initialize
 * the routes.
 */
const app = fastify({
  logger: {
    prettyPrint:
      ENV === 'dev'
        ? {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
        : false
  }
});

// fastify plugin registration
app.register(fastifyCors);

// SERVER INIT
(async () => {
  initDocumentation(app, API_VERSION);
  initPostgres(app, API_VERSION);
  initNews(app, API_VERSION)
  initRss(app, API_VERSION)

  /**
   * Route array with routing prefixes / paths
   */
  const Routes: Route[] = [
    {
      init: NewsRoutes,
      prefix: "/news",
    },
    {
      init: RssRoutes,
      prefix: "/rss",
    },
    {
      init: TypeAheadRoutes,
      prefix: "/typeahead",
    },
  ];

  // Initialize all the routes in the array, passing the db for
  // operations and the app for creating handlers
  Routes.forEach((route) => {
    app.register(
      (app, opts, done) => {
        route.init(app, {});
        app.log.info(`Initialized ${route.prefix}!`);
        done();
      },
      {
        prefix: route.prefix,
      }
    );
  });

  await app.ready();
  app.swagger();
  let listeningResult = await app.listen(PORT);
  app.log.info(`Fastify initialized at ${listeningResult}`);
})();

