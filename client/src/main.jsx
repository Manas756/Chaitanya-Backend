import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowUpRight, CheckCircle2, CircleAlert, ClipboardList, Cloud, KeyRound, LogOut, Megaphone, PlusCircle, RefreshCw, ShieldCheck, Ticket, UserRound, Users, WalletCards } from 'lucide-react'
import './styles.css'

const groups = [
  { id: 'health', label: 'Health', icon: Activity },
  { id: 'auth', label: 'Authentication', icon: KeyRound },
  { id: 'events', label: 'Events', icon: Ticket },
  { id: 'registrations', label: 'Registrations', icon: ClipboardList },
  { id: 'payments', label: 'Payments', icon: WalletCards },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'id-card', label: 'ID card', icon: UserRound },
]

const endpoints = {
  auth: [
    ['POST', '/api/auth/register', '{\n  "name": "Test User",\n  "email": "your-email@example.com",\n  "password": "Test@12345"\n}'],
    ['POST', '/api/auth/verify-otp', '{\n  "email": "your-email@example.com",\n  "otp": "123456"\n}'],
    ['POST', '/api/auth/login', '{\n  "email": "your-email@example.com",\n  "password": "Test@12345"\n}'],
    ['POST', '/api/auth/forgot-password', '{\n  "email": "your-email@example.com"\n}'],
    ['POST', '/api/auth/reset-password', '{\n  "email": "your-email@example.com",\n  "otp": "123456",\n  "password": "NewTest@12345"\n}'],
    ['POST', '/api/auth/google', '{\n  "idToken": "paste-google-id-token"\n}'],
    ['POST', '/api/auth/refresh', '{\n  "refreshToken": "stored-refresh-token"\n}'],
    ['POST', '/api/auth/logout', '{\n  "refreshToken": "stored-refresh-token"\n}'],
  ],
  events: [
    ['GET', '/api/events', ''],
    ['GET', '/api/events?featured=true', ''],
    ['GET', '/api/events?category=hackathon', ''],
    ['GET', '/api/events/:id', ''],
    ['POST', '/api/events', '{\n  "title": "Console Hackathon",\n  "description": "Test event",\n  "category": "hackathon",\n  "capacity": 50,\n  "fee": 0,\n  "startsAt": "2026-09-01T09:00:00.000Z",\n  "endsAt": "2026-09-01T17:00:00.000Z",\n  "venue": "Main Hall",\n  "status": "published"\n}'],
    ['PATCH', '/api/events/:id', '{\n  "status": "published"\n}'],
    ['DELETE', '/api/events/:id', ''],
  ],
  registrations: [
    ['POST', '/api/registration/individual', '{\n  "eventId": "event-object-id"\n}'],
    ['POST', '/api/registration/team/create', '{\n  "eventId": "event-object-id",\n  "teamName": "Console Team"\n}'],
    ['POST', '/api/registration/team/join', '{\n  "eventId": "event-object-id",\n  "teamCode": "ABC123"\n}'],
    ['GET', '/api/registration/me', ''],
    ['DELETE', '/api/registration/:id', ''],
  ],
  payments: [
    ['POST', '/api/payments/orders', '{\n  "registrationId": "registration-object-id"\n}'],
    ['POST', '/api/payments/verify', '{\n  "registrationId": "registration-object-id",\n  "razorpayOrderId": "order-id",\n  "razorpayPaymentId": "payment-id",\n  "razorpaySignature": "signature"\n}'],
  ],
  announcements: [
    ['GET', '/api/announcements', ''],
    ['POST', '/api/announcements', '{\n  "title": "Console announcement",\n  "message": "Created from the API console.",\n  "published": true\n}'],
    ['PATCH', '/api/announcements/:id', '{\n  "published": true\n}'],
    ['DELETE', '/api/announcements/:id', ''],
  ],
  'id-card': [['GET', '/api/id-card/me', '']],
}

function App() {
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('baseUrl') || 'http://localhost:3000')
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '')
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '')
  const [responses, setResponses] = useState({})
  const [health, setHealth] = useState(null)

  const request = async (key, method, path, body) => {
    const started = performance.now()
    const actualPath = path
    const options = { method, headers: {} }
    if (accessToken) options.headers.Authorization = `Bearer ${accessToken}`
    if (body.trim()) {
      options.headers['Content-Type'] = 'application/json'
      try { options.body = JSON.stringify(JSON.parse(body)) } catch { setResponses((old) => ({ ...old, [key]: { status: 400, ms: 0, data: { error: 'Request body is not valid JSON.' } } })); return }
    }
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}${actualPath}`, options)
      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('json') ? await response.json() : await response.text()
      if (data?.token) { localStorage.setItem('accessToken', data.token); setAccessToken(data.token) }
      if (data?.refreshToken) { localStorage.setItem('refreshToken', data.refreshToken); setRefreshToken(data.refreshToken) }
      const result = { status: response.status, ms: Math.round(performance.now() - started), data }
      setResponses((old) => ({ ...old, [key]: result }))
      if (actualPath === '/health') setHealth(data)
    } catch (error) {
      setResponses((old) => ({ ...old, [key]: { status: 'ERR', ms: Math.round(performance.now() - started), data: { error: error.message, hint: 'Start the backend and check CORS.' } } }))
    }
  }

  const saveBase = (value) => { setBaseUrl(value); localStorage.setItem('baseUrl', value) }
  const clearSession = () => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); setAccessToken(''); setRefreshToken('') }
  const healthCheck = () => request('health', 'GET', '/health', '')

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark">CT</div><div><p className="eyebrow">Chaitaniya / verification workspace</p><h1>API Console</h1></div></div>
      <div className="top-actions"><span className={`health-pill ${health?.status === 'ok' ? 'is-good' : health ? 'is-bad' : ''}`}><span className="status-dot" />{health?.status === 'ok' ? 'Backend healthy' : health ? 'Backend degraded' : 'Not checked'}</span><button className="icon-button" title="Run health check" onClick={healthCheck}><RefreshCw size={16} /></button></div>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <div className="connection-block"><label htmlFor="baseUrl">Backend base URL</label><input id="baseUrl" value={baseUrl} onChange={(event) => saveBase(event.target.value)} /></div>
        <div className="session-card"><div className="session-heading"><ShieldCheck size={16} /><span>Session state</span></div><strong>{accessToken ? 'Authenticated' : 'Signed out'}</strong><p>{refreshToken ? 'Redis refresh session stored' : 'No refresh session stored'}</p>{accessToken && <button className="text-button" onClick={clearSession}><LogOut size={14} /> Clear local session</button>}</div>
        <nav className="side-nav"><p className="nav-label">API surface</p>{groups.map(({ id, label, icon: Icon }) => <a href={`#${id}`} key={id}><Icon size={16} />{label}<ArrowUpRight size={13} /></a>)}</nav>
        <div className="sidebar-foot"><Cloud size={15} /><span>MongoDB source of truth<br />Redis session layer</span></div>
      </aside>
      <main className="content">
        <section className="intro"><div><p className="eyebrow coral">Live request runner</p><h2>Check the whole backend.</h2><p>Run each endpoint against your local server. Responses, status codes, timing, and session tokens stay visible in this workspace.</p></div><button className="primary-button" onClick={healthCheck}><Activity size={17} /> Check health</button></section>
        <section id="health" className="health-section"><div className="section-title"><div><p className="eyebrow">01 / system</p><h2>Health check</h2></div><span className="method-badge get">GET /health</span></div><p className="section-copy">Confirms the server is responding and reports MongoDB and Redis state.</p><EndpointCard endpoint={['GET', '/health', '']} response={responses.health} onRun={(m,p,b) => request('health',m,p,b)} /></section>
        {Object.entries(endpoints).map(([group, items], index) => <section id={group} key={group}><div className="section-title"><div><p className="eyebrow">{String(index + 2).padStart(2, '0')} / {group.replace('-', ' ')}</p><h2>{group === 'id-card' ? 'Participant ID card' : group[0].toUpperCase() + group.slice(1)}</h2></div><span className="count-label">{items.length} endpoints</span></div>{group === 'registrations' && <TeamRegistrationPanel onRequest={request} />}<div className="endpoint-grid">{items.map((endpoint, itemIndex) => { const key = `${group}-${itemIndex}`; return <EndpointCard key={key} endpoint={endpoint} response={responses[key]} onRun={(m,p,b) => request(key,m,p,b)} /> })}</div></section>)}
      </main>
    </div>
  </div>
}

function TeamRegistrationPanel({ onRequest }) {
  const [mode, setMode] = useState('create')
  const [eventId, setEventId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [result, setResult] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    const path = mode === 'create' ? '/api/registration/team/create' : '/api/registration/team/join'
    const body = mode === 'create' ? { eventId, teamName } : { eventId, teamCode }
    const response = await onRequest(`guided-${mode}`, 'POST', path, JSON.stringify(body))
    setResult(response)
  }

  return <div className="team-panel"><div className="team-panel-head"><div><p className="eyebrow coral">Event registration</p><h3>Choose your team path</h3><p>Team choice happens here, after signup. Create a team and share its code, or join one with a code.</p></div><Users size={28} /></div><div className="choice-tabs"><button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}><PlusCircle size={16} /> Create a team</button><button className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}><Users size={16} /> Join a team</button></div><form className="team-form" onSubmit={submit}><label>Event ID<input value={eventId} onChange={(event) => setEventId(event.target.value)} placeholder="Published event MongoDB ID" required /></label>{mode === 'create' ? <label>Team name<input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="e.g. Team Horizon" required /></label> : <label>Team code<input value={teamCode} onChange={(event) => setTeamCode(event.target.value.toUpperCase())} placeholder="e.g. A1B2C3" required /></label>}<button className="team-submit" type="submit">{mode === 'create' ? 'Create team and register' : 'Join team and register'}<ArrowUpRight size={15} /></button></form>{result && <pre className="team-result">{JSON.stringify(result, null, 2)}</pre>}</div>
}

function EndpointCard({ endpoint, response, onRun }) {
  const [method, path, initialBody] = endpoint
  const [actualPath, setActualPath] = useState(path)
  const [body, setBody] = useState(initialBody)
  return <article className="endpoint-card"><div className="endpoint-head"><span className={`method-badge ${method.toLowerCase()}`}>{method}</span><input className="path-input" value={actualPath} onChange={(event) => setActualPath(event.target.value)} aria-label={`${method} endpoint path`} /></div>{method !== 'GET' && <textarea value={body} onChange={(event) => setBody(event.target.value)} spellCheck="false" aria-label={`${method} ${path} request body`} />}{actualPath.includes(':id') && <p className="path-note"><CircleAlert size={13} /> Replace `:id` above with a real MongoDB ID.</p>}<button className="run-button" onClick={() => onRun(method, actualPath, body)}>{method === 'GET' ? 'Run request' : 'Send request'}<ArrowUpRight size={15} /></button>{response && <div className="response"><div className="response-meta"><span className={response.status >= 200 && response.status < 300 ? 'response-good' : 'response-bad'}>{response.status >= 200 && response.status < 300 ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />} HTTP {response.status}</span><span>{response.ms} ms</span></div><pre>{typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}</pre></div>}</article>
}

createRoot(document.getElementById('root')).render(<App />)
