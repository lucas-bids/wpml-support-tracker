export default function TicketList({ tickets = [], onDelete }) {
  if (!tickets.length) {
    return <div className="muted">No tickets yet.</div>
  }

  return (
    <ol className="list">
      {tickets.map((t, idx) => (
        <li key={t.id} className="space-between">
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <a href={t.url} target="_blank" rel="noreferrer">
              {t.url}
            </a>
            <span className="muted" style={{ marginLeft: 8 }}>({t.type})</span>
          </div>
          <button className="btn danger" onClick={() => onDelete(t.id)} aria-label={`Delete ticket #${idx+1}`}>
            Delete
          </button>
        </li>
      ))}
    </ol>
  )
}


