import React from 'react';
import { CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from './Icons';

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px'
      }}
    >
      {toasts.map((toast) => {
        let bgColor = '#0f172a';
        let borderColor = '#334155';
        let IconComp = InfoIcon;

        if (toast.type === 'success') {
          bgColor = '#065f46';
          borderColor = '#059669';
          IconComp = CheckCircleIcon;
        } else if (toast.type === 'danger') {
          bgColor = '#991b1b';
          borderColor = '#dc2626';
          IconComp = AlertCircleIcon;
        } else if (toast.type === 'warning') {
          bgColor = '#92400e';
          borderColor = '#d97706';
          IconComp = AlertTriangleIcon;
        }

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '13px',
              fontWeight: 500,
              animation: 'hwFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconComp size={16} />
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Dismiss notification"
            >
              <XIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
