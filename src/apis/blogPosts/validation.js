import { checkSchema, validationResult } from 'express-validator'
import createError from 'http-errors'

const blogPostSchema = {
  category: {
    in: ['body'],
    isString: {
      errorMessage: 'Category is a mandatory field'
    }
  },
  title: {
    in: ['body'],
    isString: {
      errorMessage: 'title is a mandatory field'
    }
  },
  cover: {
    in: ['body'],
    isString: {
      errorMessage: 'cover is mandatory'
    }
  },
  readTime: {
    in: ['body'],
    isObject: {
      errorMessage: 'readTime must be defined in body as object type'
    }
  },
  'readTime.value': {
    in: ['body'],
    isInt: {
      errorMessage: 'must enter a unit of time'
    }
  },
  'readTime.unit': {
    in: ['body'],
    isString: {
      errorMessage: 'must enter a number'
    }
  },

  'author.name': {
    in: ['body'],
    isString: {
      errorMessage: 'must enter a name'
    }
  },

  'author.avatar': {
    in: ['body'],
    isURL: {
      errorMessage: 'enter your avatar here'
    }
  },
  content: {
    in: ['body'],
    isString: {
      errorMessage: 'enter the content of your blog post here'
    }
  }
}
export const checkBlogPostsSchema = checkSchema(blogPostSchema)

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    next(createError(400, 'validation errors!', { errorsList: errors.array() }))
  } else {
    next()
  }
}
