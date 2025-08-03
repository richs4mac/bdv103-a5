import createServer from './src/server.js'

const app = await createServer()

app.listen(3000)
