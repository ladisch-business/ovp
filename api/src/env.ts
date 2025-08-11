import 'dotenv/config'

export const AUTH_USER = process.env.AUTH_USER || 'username'
export const AUTH_PASS = process.env.AUTH_PASS || 'password'
export const PORT = Number(process.env.PORT || 8080)
export const DATA_DIR = process.env.OVP_DATA_DIR || '/srv/docker/ovp'
export const CORS_ORIGIN = process.env.API_CORS_ORIGIN || 'http://localhost:5173'
