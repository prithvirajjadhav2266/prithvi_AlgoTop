import React, { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: ReactNode
  fullWidth?: boolean
  icon?: ReactNode
}

/**
 * Reusable Button Component
 * 
 * A flexible button component with multiple variants and sizes.
 * Built on DaisyUI with TypeScript support.
 * 
 * @param variant - Button style (primary, secondary, success, error, warning, info, ghost)
 * @param size - Button size (xs, sm, md, lg)
 * @param loading - Show loading spinner
 * @param disabled - Disable button interaction
 * @param children - Button text/content
 * @param fullWidth - Stretch button to full width
 * @param icon - Optional icon element displayed before text
 * @param ...rest - Standard HTML button attributes
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  fullWidth = false,
  icon,
  className = '',
  ...rest
}) => {
  // Map variant prop to DaisyUI button classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    error: 'btn-error',
    warning: 'btn-warning',
    info: 'btn-info',
    ghost: 'btn-ghost',
  }

  // Map size prop to DaisyUI button size classes
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  // Combine all classes
  const baseClasses = 'btn transition-all duration-200'
  const computedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'loading' : ''}
    ${className}
  `.trim()

  return (
    <button
      className={computedClasses}
      disabled={disabled || loading}
      {...rest}
    >
      {/* Show loading spinner if loading prop is true */}
      {loading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          {children}
        </>
      ) : (
        <>
          {/* Display icon before text if provided */}
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

export default Button
