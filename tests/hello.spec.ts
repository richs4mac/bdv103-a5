import { describe, expect, it } from 'vitest'
import setupTest, { type LocalTestContext } from './setup.js'

await setupTest()

describe('Hello endpoint', async () => {
  // I don't know how to get this from the generated SDK
  // const client = new DefaultApi(new Configuration({ basePath: address }))
  // also the context is returning an address that's just "::"
  it<LocalTestContext>('should return Hello sam', async () => {
    const response = await fetch('http://localhost:3000/hello/sam')
    const data = await response.text()

    expect(response.status).toBe(200)
    expect(data).toBe('Hello sam')
  })
})
