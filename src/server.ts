import cors from '@koa/cors'
import KoaRouter from '@koa/router'
import { type IncomingMessage, type Server, type ServerResponse } from 'http'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import qs from 'koa-qs'
import { koaSwagger } from 'koa2-swagger-ui'
import { RegisterRoutes } from '../tsoa/routes.js'
import swagger from '../tsoa/swagger.json' with { type: 'json' }
import { getBookDatabase } from './books/books_database.js'
import { type AppBookDatabaseState } from './books/types.js'
import { type AppWarehouseDatabaseState } from './warehouse/types.js'
import { getDefaultWarehouseDatabase } from './warehouse/warehouseDb.js'

// port = 0 will make Node pick a random available port
const createServer = async ({ port = 0, randomizeDbNames }: { port?: number, randomizeDbNames?: boolean } = {}): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> => {
  const bookDb = getBookDatabase((randomizeDbNames ?? false) ? undefined : 'bookDb')
  const warehouseDb = await getDefaultWarehouseDatabase((randomizeDbNames ?? false) ? undefined : 'warehouseDb')
  const state = { bookDb, warehouseDb }
  const app = new Koa<AppBookDatabaseState & AppWarehouseDatabaseState, Koa.DefaultContext>()

  app.use(async (ctx, next): Promise<void> => {
    ctx.state = state
    await next()
  })

  app.use(bodyParser())

  // We use koa-qs to enable parsing complex query strings, like our filters.
  qs(app)

  // And we add cors to ensure we can access our API from the mcmasterful-books website
  app.use(cors())

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

export default createServer
