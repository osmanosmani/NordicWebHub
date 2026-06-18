import { ButtonLink } from '../../components/ui/Button'
import { useLanguage } from '../../context/useLanguage'

export function Unauthorized() {
  const { t } = useLanguage()

  return (
    <section className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase text-red-700">
          {t('auth.accessDenied')}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">
          {t('auth.noAccess')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t('auth.noAccessText')}
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink to="/" variant="secondary">
            {t('common.goHome')}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
