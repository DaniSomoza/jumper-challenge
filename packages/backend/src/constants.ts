import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../../../.env') })

export const BACKEND_PORT = Number(process.env.BACKEND_PORT || 4_000)

export const JWT_SECRET = process.env.JWT_SECRET!
export const NONCE_EXPIRATION_TIME = process.env.NONCE_EXPIRATION_TIME!
export const SESSION_EXPIRATION_TIME = process.env.SESSION_EXPIRATION_TIME!
export const COOKIE_EXPIRATION_TIME = 60 * 60 * 24 * 3 // 3 days

export const FRONTEND_ORIGINS =
  process.env.FRONTEND_ORIGIN!.split(',').map((origin) => origin.trim()) || []

export const HOST = '0.0.0.0'

export const alchemyApiKey = process.env.ALCHEMY_API_KEY || ''
export const moralisApiKey = process.env.MORALIS_API_KEY || ''
