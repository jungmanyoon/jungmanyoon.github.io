import React from 'react'

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  fullWidth = false,
  ...props
}) {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'

  // primary(CTA)만 brand(amber). secondary/outline은 뉴트럴로 de-amber. danger는 의미색 유지.
  const variantClasses = {
    primary: 'bg-brand-500 text-white shadow-sm hover:bg-brand-600 focus:ring-brand-500',
    secondary: 'bg-surface-muted text-ink border border-line hover:bg-line focus:ring-brand-500',
    outline: 'border border-line text-ink-muted hover:bg-surface-muted hover:text-ink focus:ring-brand-500',
    danger: 'bg-danger text-white hover:bg-rose-600 focus:ring-danger'
  }
  
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  const widthClasses = fullWidth ? 'w-full' : ''

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `.trim()
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button