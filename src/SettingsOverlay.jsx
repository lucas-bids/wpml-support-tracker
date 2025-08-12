import { useEffect, useRef } from 'react'
import MonthSettings from './components/MonthSettings.jsx'

export default function SettingsOverlay({ open, onClose, user, monthKey, value }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="overlay__panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <div className="overlay__header">
          <div className="title">Month Settings</div>
          <button className="btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <MonthSettings user={user} monthKey={monthKey} value={value} onSaved={onClose} />
      </div>
    </div>
  )
}


