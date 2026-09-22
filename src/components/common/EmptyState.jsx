import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="hw-empty-state">
      {IconComponent && (
        <div className="hw-empty-icon">
          <IconComponent size={28} />
        </div>
      )}
      <h3 className="hw-empty-title">{title}</h3>
      {description && <p className="hw-empty-desc">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
