import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
// import fs from 'fs-extra'
import uniqid from 'uniqid'
import multer from 'multer'
// import { getAuthors } from '../../lib/fs-tools'
import { saveAuthorsAvatar } from '../../lib/fs-tools.js'
import fs from 'fs-extra'
import json2csv from 'json2csv'
import { pipeline } from 'stream'
import { getAuthorsReadableStream } from '../../lib/fs-tools.js'
import nodemailer from 'nodemailer'

const authorsRouter = express.Router()

const sendEmail = async () => {
  // let testAccount = await nodemailer.createTestAccount()

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  let info = await transporter.sendMail({
    from: '"Leon Bourke" <lbourke1234@gmail.com>',
    to: 'lbourke1234@gmail.com',
    subject: 'Hello ',
    text: 'Hello world?',
    html: '<b>Hello world?</B>'
  })

  transporter.verify((error, success) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Server is ready to take our messages')
    }
  })

  console.log('Message sent: %s', info.messageId)

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}

authorsRouter.get('/:random/sendemailtest', async (req, res, next) => {
  try {
    console.log(process.env.EMAIL_USERNAME)
    await sendEmail()
    // console.log('hello')
  } catch (error) {
    console.log('error in email catch')
    next(error)
  }
})

// const currentFileURL = import.meta.url
// console.log('current file url: ', currentFileURL)

// const currentFilePath = fileURLToPath(currentFileURL)
// console.log('current file path: ', currentFilePath)

// const parentFolderPath = dirname(currentFilePath)
// console.log('parent folder path: ', parentFolderPath)

// const authorsJSONPath = join(parentFolderPath, 'authors.json')
// console.log(authorsJSONPath)

const authorsJSONPath = join(
  dirname(dirname(dirname(fileURLToPath(import.meta.url)))),
  '/data/authors.json'
)

// const getAuthors = async () => {
//   fs.readFile(authorsJSONPath)
// }

authorsRouter.get('/', (req, res) => {
  const fileContent = fs.readFileSync(authorsJSONPath)
  console.log('Content: ', fileContent)

  const authorsArray = JSON.parse(fileContent)
  console.log('content as a json ', authorsArray)

  res.send(authorsArray)
})

authorsRouter.post('/', (req, res) => {
  console.log('req body: ', req.body)

  const newAuthor = {
    ...req.body,
    id: uniqid(),
    avatar:
      'https://ui-avatars.com/api/name=' +
      req.body.name +
      ' ' +
      req.body.surname
  }

  console.log('new author: ', newAuthor)

  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))

  authors.push(newAuthor)

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors))

  res.status(201).send({ id: newAuthor.id })
})

authorsRouter.post(
  '/:postId/uploadAvatar',
  multer({}).single('avatar'),
  async (req, res, next) => {
    try {
      console.log('FILE: ', req.file)
      await saveAuthorsAvatar(req.file.id, req.file.buffer)
      res.send()
    } catch (error) {
      next(error)
    }
  }
)

authorsRouter.get('/:userId', (req, res) => {
  const userID = req.params.userId
  console.log('User Id---------: ', userID)

  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))

  const foundAuthor = authors.find((author) => author.id === userID)

  res.send(foundAuthor)
})

authorsRouter.put('/:userId', (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))

  const index = authors.findIndex((author) => author.id === req.params.userId)
  const authorToBeModified = authors[index]

  const updatedAuthor = {
    ...authorToBeModified,
    ...req.body,
    updatedAt: new Date()
  }
  authors[index] = updatedAuthor

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors))

  res.send(updatedAuthor)
})

authorsRouter.delete('/:Id', (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath))

  const remainingAuthors = authors.filter(
    (author) => author.id !== req.params.Id
  )
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))

  res.status(204).send()
})

authorsRouter.get('/:anything/csv', (req, res, next) => {
  try {
    res.setHeader('Content-Disposition', 'attachment; filename="authors.csv"')

    const source = getAuthorsReadableStream()
    const destination = res
    const transform = new json2csv.Transform({
      fields: ['name', 'surname', 'email', 'dob', 'id', 'avatar', 'updatedAt']
    })

    pipeline(source, transform, destination, (err) => {
      if (err) console.log('Pipeline error', err)
    })
  } catch (error) {
    console.log('csv catch error')
    next(error)
  }
})

export default authorsRouter
