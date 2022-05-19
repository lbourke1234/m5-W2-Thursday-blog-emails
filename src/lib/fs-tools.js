import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { writeFile } = fs

const authorsPublicFolderPath = join(process.cwd(), '/public/img/authors')
const blogPostsPublicFolderPath = join(process.cwd(), '/public/img/blogPosts')

// const apisFolderPath = join(dirname(fileURLToPath(import.meta.url)), '/apis')

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), '/data')
export const getAuthors = () => {
  console.log(dataFolderPath)
}

export const saveAuthorsAvatar = (fileName, contentAsBuffer) =>
  writeFile(join(authorsPublicFolderPath, fileName), contentAsBuffer)

export const saveBlogPostCoverPhoto = (fileName, contentAsBuffer) =>
  writeFile(join(blogPostsPublicFolderPath, fileName), contentAsBuffer)
