const express = require('express')
const proxy = require('http-proxy-middleware')
const app = express()

// app.use(proxy('/api', {target: 'http://localhost:3001'}))
// app.use('/api', proxy({target: 'http://localhost:3001'}))
// 上两行的效果是一样的，所不同的是
// 前者是express做路由控制
// 后者主要是http-proxy-middleware做路由控制
// 其实两个都加上也是一样的效果，即
// app.use('/api', proxy('/api', {target: 'http://localhost:3001'}))

app.use(
  '/api',  // path
  proxy(
    {
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '/api/op': '/path'
      },
      router: {
        'df.localhost:3000': 'http://localhost:3002'
      }
    }
  )
)

app.use(
  '/df',  // path
  proxy(
    {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  )
)

app.use(
  '/',  // path
  proxy(
    {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  )
)

app.listen(3000)
