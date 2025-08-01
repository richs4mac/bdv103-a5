// from this example https://github.com/lukeautry/tsoa/blob/master/tests/fixtures/koa/server.ts

import KoaRouter from '@koa/router';
import Koa from 'koa';
import { koaSwagger } from 'koa2-swagger-ui';
import swagger from './tsoa/swagger.json';

import bodyParser from 'koa-bodyparser';
import { RegisterRoutes } from './tsoa/routes';

const app = new Koa();
app.use(bodyParser());

const router = new KoaRouter();

(RegisterRoutes as (router: KoaRouter) => void)(router);

// It's important that this come after the main routes are registered
app.use(async (context, next) => {
  try {
    await next();
  } catch (err: any) {
    context.status = err.status || 500;
    context.body = err.message || 'An error occurred during the request.';
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.use(koaSwagger({
  routePrefix: '/docs',
  specPrefix: '/docs/spec',
  exposeSpec: true,
  swaggerOptions: { spec: swagger }
}));

export const server = app.listen(3000);