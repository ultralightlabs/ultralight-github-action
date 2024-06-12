import { createReadStream, createWriteStream, lstatSync, existsSync } from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import path from 'path'
import { getAuthHeader } from './utils'
import archiver from 'archiver'

export const uploadFile = async (
  filepath: string,
  ultralightUrl: string
): Promise<{ key: string; bucket: string }> => {
  let filename = path.basename(filepath)
  const archive = archiver('zip', { zlib: { level: 9 } })
  if (!existsSync(filepath)) {
    throw new Error(`File or directory not found: ${filepath}`)
  }
  if (lstatSync(filepath).isDirectory()) {
    archive.directory(filepath, false)
    filename = `${filename}.zip`
    filepath = `${filepath}.zip`
    archive.pipe(createWriteStream(filepath))
    await archive.finalize()
  }
  const presignedPostResponse = await axios.post(
    new URL('/api/v1/report/presigned-url', ultralightUrl).toString(),
    {
      filename
    },
    {
      headers: {
        ...getAuthHeader()
      }
    }
  )

  const formData = new FormData()
  for (const [key, value] of Object.entries(
    presignedPostResponse.data.fields
  )) {
    formData.append(key, value)
  }
  formData.append('file', createReadStream(filepath))
  try {
    await axios.post(presignedPostResponse.data.url, formData)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }
    throw new Error('Failed to upload file')
  }

  return {
    key: presignedPostResponse.data.fields.key,
    bucket: presignedPostResponse.data.fields.bucket
  }
}
