import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { useAuth } from '../../context/useAuth'
import { getDefaultRouteForUser } from '../../utils/authRoutes'
import { getErrorMessage } from '../../utils/getErrorMessage'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await login({ email, password })
      const state = location.state as LocationState | null
      navigate(state?.from?.pathname || getDefaultRouteForUser(user), {
        replace: true,
      })
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Login failed. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">Log in</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Access your NordicWebHub client portal account.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            autoComplete="email"
            id="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextInput
            autoComplete="current-password"
            id="password"
            label="Password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New customer?{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  )
}
