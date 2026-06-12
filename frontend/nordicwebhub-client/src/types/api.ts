export type ApiErrorResponse = {
  detail?: string
  message?: string
  title?: string
  errors?: string[] | Record<string, string[] | string>
}
