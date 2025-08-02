import createServer from '../src/server.js'
import { afterAll, beforeAll } from 'vitest'

// didn't add these functions to test context because it seems redundant

const setupTest = (): void => {
  const server = createServer()

  beforeAll(async () => {
    server.listen(0)
  })

  afterAll(async () => {
    // TODO this isn't a valid function?
    // server.close()
  })
}

export default setupTest
