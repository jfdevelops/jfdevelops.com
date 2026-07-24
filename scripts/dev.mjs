process.env.CI = 'true'

const { createServer } = await import('vite')
const server = await createServer({
  server: {
    host: process.env.HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 3000),
    strictPort: true,
  },
})

await server.listen()
server.printUrls()
