import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className, disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantStyles = {
      primary: 'bg-boutique-primary text-white hover:bg-gray-800 focus:ring-boutique-primary',
      secondary: 'bg-boutique-accent text-white hover:bg-yellow-700 focus:ring-boutique-accent',
      outline: 'border-2 border-boutique-primary text-boutique-primary hover:bg-boutique-primary hover:text-white focus:ring-boutique-primary',
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
        {...props}
      >
        {loading ? '...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
