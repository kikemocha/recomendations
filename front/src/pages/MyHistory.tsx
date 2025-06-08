import React, { useEffect, useRef, useState } from 'react'
import { getUserHistory } from '../api'
import type { RatedMovie } from '../api'
import { useMyContext } from '../context/MyContext'

const LIMIT = 20

const MyHistory: React.FC = () => {
  const { username } = useMyContext()
  const userId = parseInt(username ?? '', 10)

  const [history,   setHistory]   = useState<RatedMovie[]>([])
  const [offset,    setOffset]    = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [hasMore,   setHasMore]   = useState(true)      // <- nuevo
  const sentinelRef = useRef<HTMLDivElement>(null)

  /* fetch cuando cambian offset o userId */
  useEffect(() => {
    if (!Number.isFinite(userId) || !hasMore) return
    let cancelled = false
    setLoading(true)

    getUserHistory({ userId, limit: LIMIT, offset })
      .then(page => {
        if (cancelled) return
        if (page.length < LIMIT) setHasMore(false)       // <- si no hay más
        setHistory(prev => [...prev, ...page])
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [offset, userId, hasMore])

  /* IntersectionObserver */
  useEffect(() => {
    console.log('history: ', history)
    if (!sentinelRef.current || !hasMore) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          setOffset(prev => prev + LIMIT)
        }
      },
      { root: null, rootMargin: '0px', threshold: 1 }
    )

    obs.observe(sentinelRef.current)
    return () => { obs.disconnect() }
  }, [loading, hasMore])

  if (!Number.isFinite(userId))
    return <p className="text-center text-red-600 mt-4">
      Inicia sesión con tu número de usuario
    </p>

  return (
    <div className="flex flex-col items-center gap-4">
      {history.map(item => (
        <div
          key={`${item.movie.id_movie}-${item.timestamp}`}
          className={`w-11/12 md:w-2/3 xl:w-1/2 p-4 border rounded-xl shadow  flex-col md:flex-row gap-4 ${item.movie.title ? 'flex' : 'hidden'}`}
        >
          {item.movie.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.movie.poster_path}`}
              alt={item.movie.title}
              className="h-40 w-auto self-center"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.movie.title}</h3>
            <p className="text-sm italic">{item.movie.original_title}</p>
            <p className="mt-2"><span className="font-semibold">Rating:</span> {item.rating}</p>
            <p><span className="font-semibold">Fecha:</span> {item.timestamp}</p>
          </div>
        </div>
      ))}

      {loading && <p>Cargando…</p>}
      {/* solo renderiza el sentinel si todavía hay más */}
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </div>
  )
}

export default MyHistory
