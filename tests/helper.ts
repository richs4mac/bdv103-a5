import createServer from 'src/server.js'
import { afterEach, beforeEach } from 'vitest'

// didn't add these functions to test context because it seems redundant

const setupTest = (): void => {
  const server = createServer()

  beforeEach(async () => {
    server.listen(0)
  })

  afterEach(async () => {
    server.close()
  })
}

export default setupTest
