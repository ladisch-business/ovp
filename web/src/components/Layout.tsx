import React from 'react'

import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../store/auth'
import { apiFetch } from '../lib/api'

type Cat = { category: string; tags: string[] }

async function fetchCategories(): Promise<Cat[]> {
  const res = await apiFetch('/settings/categories')
  if (!res.ok) return []
  return res.json()
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const { logout } = useAuth()
  const { data: cats = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 hidden md:block bg-neutral-950 border-r border-neutral-800 p-4">
        <h2 className="text-sm uppercase text-neutral-400 mb-3">Kategorien</h2>
        <div className="space-y-3">
          {cats.map((c) => (
            <div key={c.category}>
              <div className="text-neutral-200 font-medium">{c.category}</div>
              <div className="mt-1 space-y-1">
                {c.tags.map((t) => (
                  <button
                    key={t}
                    className="text-neutral-400 hover:text-white text-sm block text-left w-full"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {cats.length === 0 && <div className="text-neutral-500 text-sm">Keine Kategorien</div>}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-neutral-800 flex items-center px-4 gap-6">
          <div className="font-semibold">OVP</div>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
              }
              end
            >
              Start
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
              }
            >
              Upload
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
              }
            >
              Favoriten
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
              }
            >
              Einstellungen
            </NavLink>
          </nav>
          <div className="ml-auto">
            <button
              onClick={async () => {
                await logout()
                nav('/login', { replace: true })
              }}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
            >
              Abmelden
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
