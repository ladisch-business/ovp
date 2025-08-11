import { useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

const CHUNK_SIZE = 8 * 1024 * 1024

export default function UploadPage() {
  const [progressFile, setProgressFile] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0]
    if (!file) return
    setStatus('Initialisiere Upload...')
    const initRes = await apiFetch('/uploads/init', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, size: file.size, mime: file.type })
    })
    const { id } = await initRes.json()
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)
      const form = new FormData()
      form.append('chunk', chunk)
      form.append('index', String(i))
      setStatus(`Sende Chunk ${i + 1}/${totalChunks}...`)
      await fetch((import.meta as any).env.VITE_API_BASE + `/api/uploads/${id}`, {
        method: 'PATCH',
        body: form,
        credentials: 'include'
      })
      setProgressFile(((i + 1) / totalChunks) * 100)
      setProgressTotal(((i + 1) / totalChunks) * 100)
    }

    setStatus('Fasse Chunks zusammen...')
    await apiFetch(`/api/uploads/${id}/concat`, {
      method: 'POST',
      body: JSON.stringify({ parts: Math.ceil(file.size / CHUNK_SIZE) })
    })
    setStatus('Fertig')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload</h1>
      <input ref={inputRef} type="file" className="mb-4" />
      <button
        onClick={handleUpload}
        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
        disabled={status === 'Fertig'}
      >
        Hochladen
      </button>

      <div className="mt-6 space-y-3">
        <div>
          <div className="text-sm text-neutral-400 mb-1">Fortschritt Datei</div>
          <div className="w-full h-2 bg-neutral-800 rounded">
            <div className="h-2 bg-red-600 rounded" style={{ width: `${progressFile}%` }} />
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-400 mb-1">Fortschritt Gesamt</div>
          <div className="w-full h-2 bg-neutral-800 rounded">
            <div className="h-2 bg-red-600 rounded" style={{ width: `${progressTotal}%` }} />
          </div>
        </div>
        {status && <div className="text-neutral-300">{status}</div>}
      </div>
    </div>
  )
}
