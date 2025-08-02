import KoaRouter from '@koa/router'
import { type IncomingMessage, type Server, type ServerResponse } from 'http'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { koaSwagger } from 'koa2-swagger-ui'
import { RegisterRoutes } from '../tsoa/routes.js'
import swagger from '../tsoa/swagger.json' with { type: 'json' }

// default port 0 = node will choose a random available port
const server = (port: number = 0): Server<typeof IncomingMessage, typeof ServerResponse> => {
  const app = new Koa()
  app.use(bodyParser())

  const router = new KoaRouter();

  (RegisterRoutes as (router: KoaRouter) => void)(router)

  // It's important that this come after the main routes are registered
  app.use(async (context, next) => {
    try {
      await next()
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      context.status = err?.status || 500
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      context.body = err?.message || 'An error occurred during the request.'
    }
  })

  app.use(router.routes()).use(router.allowedMethods())

  app.use(koaSwagger({
    routePrefix: '/docs',
    specPrefix: '/docs/spec',
    exposeSpec: true,
    swaggerOptions: { spec: swagger }
  }))

  return app.listen(port)
}

export default server
