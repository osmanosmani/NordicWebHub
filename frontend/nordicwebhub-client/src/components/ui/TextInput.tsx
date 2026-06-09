import type { InputHTMLAttributes } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function TextInput({ id, label, ...props }: TextInputProps) {
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="form-label">{label}</span>
      <input className="form-input" id={id} {...props} />
    </label>
  )
}
