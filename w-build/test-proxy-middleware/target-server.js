const express = require('express')

const app = express()

// 路由匹配规则是从上到下，匹配到就停止
// 所以更顶层的路由，应该配置在后面
// 更层次更深的路由配置在前面
// 这样才不会出现顶层路由覆盖其后代路由的情况
app.use('/df', express.static('./ss'))
app.use('/', express.static('./static'))

app.use('/api', (req, res) => {
  console.log(req.params)
  console.log(req.query)
  res.json({
    msg: 'Hello World'
  })
})

app.use('/path', (req, res) => {
  res.json({
    msg: '/path'
  })
})

app.listen(3001)
