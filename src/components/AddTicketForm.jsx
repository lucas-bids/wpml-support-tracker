import { useState } from 'react'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db, nowTs } from '../lib/firebase.js'
import { isValidTicketUrl, normalizeUrl } from '../lib/url.js'

export default function AddTicketForm({ user, monthKey, dateKey, existingToday = [] }) {
  const [url, setUrl] = useState('')
  const [type, setType] = useState('chat')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isValidTicketUrl(url)) {
      setError('Enter a valid http(s) URL')
      return
    }
    const normalized = normalizeUrl(url)
    if (!normalized) {
      setError('Could not normalize URL')
      return
    }

    // Client-side dedupe: check existingToday first
    const dupLocal = existingToday.some((t) => t.normalized === normalized)
    if (dupLocal) {
      setError('This ticket is already added for today')
      return
    }

    setSubmitting(true)
    try {
      // Extra safety: query Firestore for same day+normalized
      const col = collection(db, 'users', user.uid, 'tickets')
      const q = query(col, where('dateKey', '==', dateKey))
      const snap = await getDocs(q)
      const dupRemote = snap.docs.some((d) => d.data().normalized === normalized)
      if (dupRemote) {
        setError('This ticket is already added for today')
        setSubmitting(false)
        return
      }

      await addDoc(col, {
        url: url.trim(),
        type,
        createdAt: nowTs(),
        dateKey,
        monthKey,
        source: 'manual',
        normalized,
      })
      setUrl('')
      setType('chat')
    } catch (err) {
      setError('Failed to add ticket')
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid" aria-label="Add ticket form">
      <div className="form-group">
        <label>
          <span className="muted">Ticket URL</span>
          <input
            className="input"
            type="url"
            placeholder="Paste URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-group">
        <div className="row" role="group" aria-label="Ticket type">
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="chat">Chat</option>
            <option value="forum">Forum</option>
          </select>
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error ? (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      ) : null}
    </form>
  )
}


