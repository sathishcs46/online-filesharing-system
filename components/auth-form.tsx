'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter(); const isSignUp = mode === 'sign-up'
  const [name, setName] = useState('Sathish'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); const result = isSignUp ? await authClient.signUp.email({ name, email, password }) : await authClient.signIn.email({ email, password }); setLoading(false); if (result.error) { setError('Unable to authenticate. Check your details and try again.'); return }; router.push('/') ; router.refresh() }
  return <main className="auth-page"><section className="auth-card"><div className="brand"><span className="brand-mark" aria-hidden="true">CS</span><span>CloudShare</span></div><p className="eyebrow">SECURE FILE WORKSPACE</p><h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1><p className="auth-copy">{isSignUp ? 'Start sharing securely with your team.' : 'Sign in to continue to your workspace.'}</p><form onSubmit={submit} className="auth-form">{isSignUp && <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></label>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={isSignUp ? 'new-password' : 'current-password'} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" disabled={loading}>{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</button></form><p className="auth-switch">{isSignUp ? 'Already have an account? ' : 'Need an account? '}<Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Sign up'}</Link></p><p className="role-note">Admin access is assigned securely by the system after registration.</p></section></main>
}
