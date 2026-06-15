import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { TextInput } from '../../components/ui/TextInput'
import { useAuth } from '../../context/useAuth'
import { getDefaultRouteForUser } from '../../utils/authRoutes'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await register({ firstName, lastName, email, password })
      navigate(getDefaultRouteForUser(user), { replace: true })
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'Registration failed. Please try again.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">Register</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create a customer account for the NordicWebHub portal.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              autoComplete="given-name"
              id="firstName"
              label="First name"
              onChange={(event) => setFirstName(event.target.value)}
              required
              value={firstName}
            />
            <TextInput
              autoComplete="family-name"
              id="lastName"
              label="Last name"
              onChange={(event) => setLastName(event.target.value)}
              required
              value={lastName}
            />
          </div>

          <TextInput
            autoComplete="email"
            id="registerEmail"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextInput
            autoComplete="new-password"
            id="registerPassword"
            label="Password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {error ? (
            <ErrorMessage message={error} />
          ) : null}

          <Button
            isLoading={isSubmitting}
            loadingLabel="Creating account"
            type="submit"
          >
            Create account
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </section>
  )
}
