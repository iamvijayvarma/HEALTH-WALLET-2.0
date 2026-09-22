import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'primary' | 'teal' | 'green' | 'danger' | 'warning' | 'neutral'
  icon: IconComponent,
  className = '',
  ...props
}) => {
  return (
    <span className={`hw-badge hw-badge-${variant} ${className}`} {...props}>
      {IconComponent && <IconComponent size={12} />}
      {children}
    </span>
  );
};
