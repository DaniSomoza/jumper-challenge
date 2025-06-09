import type { AxiosError } from 'axios'

export type ApiServiceError = AxiosError<{ error: string }> | null

function getErrorLabel(error: ApiServiceError) {
  if (error) {
    return error.response?.data.error
  }

  return ''
}

export default getErrorLabel
