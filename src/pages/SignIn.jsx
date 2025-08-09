import { signInWithGoogle, signInAnon } from '../lib/firebase.js'

export default function SignIn() {
  const emu = import.meta.env.VITE_USE_EMULATORS === '1'
  return (
    <div className="container" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <h1 style={{ marginTop: 0 }}>Ticket Pace</h1>
        <p className="muted">Track WPML tickets and pace vs. your goal.</p>
        <div className="grid" style={{ marginTop: 16 }}>
          <button
            className="btn primary"
            onClick={signInWithGoogle}
            disabled={emu}
            aria-label="Sign in with Google"
            title={emu ? 'Disabled in emulator mode' : 'Sign in with Google'}
          >
            Continue with Google
          </button>
          <button className="btn" onClick={signInAnon} aria-label="Continue as guest">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}