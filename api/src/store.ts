import { mkdir, readFile, writeFile, rename, stat } from 'fs/promises'
import { createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { DATA_DIR } from './env.js'

const videosPath = join(DATA_DIR, 'videos.json')
const categoriesPath = join(DATA_DIR, 'categories.json')

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function ensureFile(path: string, fallback: string) {
  try {
    await stat(path)
  } catch {
    await ensureDir(dirname(path))
    await writeFile(path, fallback, 'utf8')
  }
}

export async function initStore() {
  await ensureDir(DATA_DIR)
  await ensureFile(videosPath, '[]')
  await ensureFile(categoriesPath, '[]')
}

export type Video = {
  id: string
  title: string
  category: string
  tags: string[]
  favorite: boolean
  files: {
    video: string
    preview: string
    cover: string
  }
  createdAt: string
  updatedAt: string
}

export type Category = { category: string; tags: string[] }

async function atomicWrite(path: string, data: string) {
  const tmp = path + '.tmp'
  await writeFile(tmp, data, 'utf8')
  await rename(tmp, path)
}

export async function readVideos(): Promise<Video[]> {
  const buf = await readFile(videosPath, 'utf8')
  return JSON.parse(buf)
}

export async function writeVideos(v: Video[]) {
  await atomicWrite(videosPath, JSON.stringify(v, null, 2))
}

export async function readCategories(): Promise<Category[]> {
  const buf = await readFile(categoriesPath, 'utf8')
  return JSON.parse(buf)
}

export async function writeCategories(c: Category[]) {
  await atomicWrite(categoriesPath, JSON.stringify(c, null, 2))
}

export function createFileWriteStream(path: string) {
  return createWriteStream(path)
}

export function pathJoin(...p: string[]) {
  return join(...p)
}
