import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { TextInput } from '../../components/ui/TextInput'
import { useAuth } from '../../context/useAuth'
import { useLanguage } from '../../context/useLanguage'
import { getDefaultRouteForUser } from '../../utils/authRoutes'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function Login() {
  const { login } = useAuth()
  const { t } = useLanguage()
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
      navigate(getDefaultRouteForUser(user), { replace: true })
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('auth.loginFailed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">
            {t('auth.loginTitle')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('auth.loginDescription')}
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextInput
            autoComplete="email"
            id="email"
            label={t('common.email')}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextInput
            autoComplete="current-password"
            id="password"
            label={t('common.password')}
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
            loadingLabel={t('auth.signingIn')}
            type="submit"
          >
            {t('common.signIn')}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          {t('auth.newCustomer')}{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/register">
            {t('common.createAccount')}
          </Link>
        </p>
      </div>
    </section>
  )
}
