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
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'
  
  const variantClasses = {
    primary: 'bg-bread-500 text-white hover:bg-bread-600 focus:ring-bread-500',
    secondary: 'bg-bread-200 text-bread-700 hover:bg-bread-300 focus:ring-bread-400',
    outline: 'border-2 border-bread-500 text-bread-600 hover:bg-bread-50 focus:ring-bread-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
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