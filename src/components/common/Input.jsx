import React from 'react'

function Input({
  label,
  type = 'text',
  value,
  onChange,
  onValueChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputClasses = `
    w-full px-3 py-2 border rounded-md
    focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400
    ${error ? 'border-danger' : 'border-line'}
    ${disabled ? 'bg-surface-muted text-ink-disabled cursor-not-allowed' : 'bg-surface-paper'}
    ${className}
  `.trim()

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-ink-muted mb-1">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (onValueChange) {
            onValueChange(e.target.value)
          } else if (onChange) {
            onChange(e)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  )
}

export default Input