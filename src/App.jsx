import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase.js'
import SignIn from './pages/SignIn.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (!u) navigate('/signin')
    })
    return () => unsub()
  }, [navigate])

  if (loading) return null

  return (
    <Routes>
      <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
      <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/signin" replace />} />
      <Route path="*" element={<Navigate to={user ? '/' : '/signin'} replace />} />
    </Routes>
  )
}


