import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import uniqid from 'uniqid'
import createError from 'http-errors'
import { checkBlogPostsSchema, checkValidationResult } from './validation.js'
import { saveBlogPostCoverPhoto } from '../../lib/fs-tools.js'
import multer from 'multer'
import { pipeline } from 'stream'
import { getPDFReadableStream } from '../../lib/pdf-tools.js'

const blogPostsRouter = express.Router()

const blogPostsJSONPath = join(
  dirname(dirname(fileURLToPath(import.meta.url))),
  '../data/blogPosts.json'
)
const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath))
const writeBlogPost = (newBlogPost) =>
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(newBlogPost))

blogPostsRouter.get('/:postId/pdf', async (req, res, next) => {
  try {
    res.setHeader('Content-Disposition', 'attachment; filename=pdfname.pdf')

    const blogPosts = getBlogPosts()

    const chosenBlogPost = blogPosts.find(
      (blog) => blog.id === req.params.postId
    )
    const source = getPDFReadableStream(chosenBlogPost)
    const destination = res

    pipeline(source, destination, (err) => {
      if (err) console.log('pipeline error', err)
    })
  } catch (error) {
    console.log('pdf catch')
    next(error)
  }
})

blogPostsRouter.post(
  '/',
  checkBlogPostsSchema,
  checkValidationResult,
  (req, res, next) => {
    try {
      const blogPosts = getBlogPosts()

      const newBlogPost = { ...req.body, createdAt: new Date(), id: uniqid() }

      blogPosts.push(newBlogPost)

      writeBlogPost(blogPosts)

      res.send(newBlogPost)
    } catch (error) {
      next(error)
    }
  }
)

blogPostsRouter.post(
  '/:postId/uploadCover',
  multer({}).single('cover'),
  async (req, res, next) => {
    try {
      console.log('File: ', req.file)
      await saveBlogPostCoverPhoto(req.file.originalname, req.file.buffer)
      res.send()
    } catch (error) {
      next(error)
    }
  }
)

blogPostsRouter.post(
  '/blogPosts/:postId/uploadCover',
  async (req, res, next) => {
    try {
      console.log('FILE: ', req.file)
      await saveBlogPostCoverPhoto(req.file, req.file.buffer)
    } catch (error) {
      next(error)
    }
  }
)

blogPostsRouter.get('/', (req, res, next) => {
  try {
    const blogPosts = getBlogPosts()
    console.log(blogPosts)

    res.send(blogPosts)
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:postId', (req, res, next) => {
  try {
    const blogPosts = getBlogPosts()

    const foundBlogPost = blogPosts.find(
      (blog) => blog.id === req.params.postId
    )
    if (foundBlogPost) {
      res.send(foundBlogPost)
    } else {
      next(createError(404, `book with id: ${req.params.postId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.get('/:postId/comments', (req, res, next) => {
  try {
    const rootFolder = process.cwd()
    const commentsListPath = join(rootFolder, '/src/data/comments.json')
    const comments = fs.readFileSync(commentsListPath)
    res.send(comments)
  } catch (error) {
    next(error)
  }
})

blogPostsRouter.put(
  '/:postId',
  checkBlogPostsSchema,
  checkValidationResult,
  (req, res, next) => {
    try {
      const blogPosts = getBlogPosts()

      const index = blogPosts.findIndex((post) => post.id === req.params.postId)

      if (index !== -1) {
        const oldPost = blogPosts[index]

        const newPost = { ...oldPost, ...req.body, updatedAt: new Date() }

        blogPosts[index] = newPost

        writeBlogPost(blogPosts)

        res.send(newPost)
      } else {
        next(createError(404, `Id: ${req.params.postId} not found`))
      }
    } catch (error) {
      next(error)
    }
  }
)

blogPostsRouter.delete('/:postId', (req, res, next) => {
  try {
    const blogPosts = getBlogPosts()

    const postsToKeep = blogPosts.filter((post) => post.id !== req.postId)

    writeBlogPost(postsToKeep)

    res.status(204).send('successfully deleted')
  } catch (error) {
    next(error)
  }
})

export default blogPostsRouter
