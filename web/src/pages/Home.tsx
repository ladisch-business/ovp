import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Start</h1>
      <p className="text-neutral-400 mt-2">Erfolgreich angemeldet.</p>
      <div className="mt-6">
        <Link to="/upload" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700">
          Video hochladen
        </Link>
      </div>
    </div>
  )
}
