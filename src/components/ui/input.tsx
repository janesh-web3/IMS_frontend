import * as React from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Add an icon to the left side of the input */
  leftIcon?: React.ReactNode;
  /** Add an icon to the right side of the input */
  rightIcon?: React.ReactNode;
  /** Show validation state with appropriate styling */
  validation?: 'success' | 'error' | 'warning' | 'none';
  /** Optional error message to display */
  errorMessage?: string;
  /** Optional helper text to display below the input */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type: initialType, 
    leftIcon, 
    rightIcon, 
    validation = 'none',
    errorMessage,
    helperText,
    disabled,
    required,
    ...props 
  }, ref) => {
    const [type, setType] = React.useState(initialType);
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setType(prevType => prevType === 'password' ? 'text' : 'password');
    };
    
    // Determine validation icon
    const getValidationIcon = () => {
      switch(validation) {
        case 'success': return <Check className="h-4 w-4 text-green-500" />;
        case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
        default: return null;
      }
    };
    
    // Determine validation style classes
    const getValidationClasses = () => {
      switch(validation) {
        case 'success': return 'border-green-500 focus-visible:ring-green-500';
        case 'error': return 'border-red-500 focus-visible:ring-red-500';
        case 'warning': return 'border-amber-500 focus-visible:ring-amber-500';
        default: return '';
      }
    };
    
    // Password toggle icon
    const passwordToggleIcon = initialType === 'password' ? (
      <button 
        type="button" 
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        tabIndex={-1}
        aria-label={type === 'password' ? 'Show password' : 'Hide password'}
      >
        {type === 'password' ? 
          <Eye className="h-4 w-4" /> : 
          <EyeOff className="h-4 w-4" />
        }
      </button>
    ) : null;
    
    return (
      <div className="w-full space-y-1">
        <div 
          className={cn(
            'relative flex items-center',
            disabled && 'opacity-60'
          )}
        >
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 ease-in-out',
              'placeholder:text-muted-foreground placeholder:transition-all placeholder:duration-200',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'shadow-sm hover:border-primary/80',
              isFocused && 'ring-2 ring-ring ring-offset-2',
              leftIcon && 'pl-10',
              (rightIcon || initialType === 'password' || validation !== 'none') && 'pr-10',
              type === 'date' && 'date-input', 
              type === 'time' && 'time-input',
              getValidationClasses(),
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            disabled={disabled}
            required={required}
            aria-invalid={validation === 'error'}
            aria-describedby={props.id ? `${props.id}-error ${props.id}-helper` : undefined}
            ref={ref}
            {...props}
          />
          
          {initialType === 'password' && passwordToggleIcon}
          
          {validation !== 'none' && !rightIcon && initialType !== 'password' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          )}
          
          {rightIcon && !passwordToggleIcon && validation === 'none' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(errorMessage || helperText) && (
          <div className="px-1">
            {errorMessage && validation === 'error' && (
              <p 
                className="text-xs font-medium text-red-500"
                id={props.id ? `${props.id}-error` : undefined}
              >
                {errorMessage}
              </p>
            )}
            {helperText && !errorMessage && (
              <p 
                className="text-xs text-muted-foreground"
                id={props.id ? `${props.id}-helper` : undefined}
              >
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
