import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'teal' | 'danger' | 'ghost'
  size = 'md',         // 'sm' | 'md' | 'lg'
  icon: IconComponent,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) => {
  const variantClass = `hw-btn-${variant}`;
  const sizeClass = size !== 'md' ? `hw-btn-${size}` : '';
  const blockClass = fullWidth ? 'hw-btn-block' : '';

  return (
    <button
      type={type}
      className={`hw-btn ${variantClass} ${sizeClass} ${blockClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {IconComponent && iconPosition === 'left' && <IconComponent size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
      {IconComponent && iconPosition === 'right' && <IconComponent size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
    </button>
  );
};
