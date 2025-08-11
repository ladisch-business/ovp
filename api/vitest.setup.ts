import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const tmp = mkdtempSync(join(tmpdir(), 'ovp-'))
process.env.OVP_DATA_DIR = tmp
process.env.AUTH_USER = process.env.AUTH_USER || 'username'
process.env.AUTH_PASS = process.env.AUTH_PASS || 'password'
