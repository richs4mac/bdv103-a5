import { describe, expect, it } from 'vitest'
import setupTest from './helper.js'

setupTest()

describe('Hello endpoint', async () => {
  // where do DefaultApi & Configuration come from??
  // const client = new DefaultApi(new Configuration({ basePath: address }))
  it('should return the name given as a parameter', async () => {
    const response = await fetch('http://localhost:3000/hello/sam')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toBe('sam')
  })
})
