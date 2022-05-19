import express from 'express'
import authorsRouter from './apis/authors/index.js'
import listEndPoints from 'express-list-endpoints'
import cors from 'cors'
import blogPostsRouter from './apis/blogPosts/index.js'
import {
  badRequestErrorHandler,
  unauthorizedErrorHandler,
  notFoundErrorHandler,
  genericErrorHandler
} from './errorHandlers.js'

const server = express()

const port = process.env.PORT || 5001

server.use(cors())
server.use(express.json())

server.use('/blogPosts', blogPostsRouter)
server.use('/authors', authorsRouter)

server.use(badRequestErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(notFoundErrorHandler)
server.use(genericErrorHandler)

server.listen(port, () => {
  console.table(listEndPoints(server))
  console.log('The server is now listening on port: ' + port)
})
