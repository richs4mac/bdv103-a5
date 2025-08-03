import { type IncomingMessage, type Server, type ServerResponse } from 'http'
import { beforeEach } from 'vitest'
import createServer from '../src/server.js'

export interface LocalTestContext {
  address?: string
  closeServer?: Server<typeof IncomingMessage, typeof ServerResponse>
}

const setupTest = async (): Promise<void> => {
  beforeEach<LocalTestContext>(async (context) => {
    const server = await createServer()

    const getServerAddress = server.address()
    context.address = typeof getServerAddress === 'string' ? getServerAddress : getServerAddress?.address
    context.closeServer = server.close()

    // cleanup/afterEach
    return async () => {
      server.close()
    }
  })
}

export default setupTest
