import { ButtonLink } from '../../components/ui/Button'

export function Unauthorized() {
  return (
    <section className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase text-red-700">Access denied</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">
          You cannot access this page.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your current account does not have permission for that area.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink to="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
