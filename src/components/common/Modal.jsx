import React, { useEffect } from 'react';
import { XIcon } from './Icons';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '580px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="hw-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="hw-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hw-modal-header">
          <h2 className="hw-modal-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="hw-btn hw-btn-ghost hw-btn-icon-only"
            aria-label="Close modal"
          >
            <XIcon size={18} />
          </button>
        </div>
        <div className="hw-modal-body">
          {children}
        </div>
        {footer && (
          <div className="hw-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
