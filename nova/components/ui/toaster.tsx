'use client';
import { useToastStore } from '@/lib/globalstore/toast.store';
import React, { useEffect } from 'react';

const Toast = () => {
  const { show, content, type, position, closeToast } = useToastStore();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        closeToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, closeToast]);

  if (!show) return null;

  let bgColor = '#333';
  if (type === 'success') bgColor = 'var(--color-success)';
  if (type === 'error') bgColor = 'var(--color-error)';

  let top = '20px',
    right = '20px',
    bottom = 'unset',
    left = 'unset';
  if (position === 'top-right') {
    top = '20px';
    right = '20px';
    bottom = 'unset';
    left = 'unset';
  } else if (position === 'top-left') {
    top = '20px';
    left = '20px';
    bottom = 'unset';
    right = 'unset';
  } else if (position === 'bottom-right') {
    bottom = '20px';
    right = '20px';
    top = 'unset';
    left = 'unset';
  } else if (position === 'bottom-left') {
    bottom = '20px';
    left = '20px';
    top = 'unset';
    right = 'unset';
  }

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        minWidth: 240,
        maxWidth: 400,
        padding: '14px 28px',
        color: '#fff',
        background: bgColor,
        borderRadius: 8,
        fontWeight: 600,
        fontSize: '1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        top,
        right,
        bottom,
        left,
        transition: 'opacity 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
      role="alert"
    >
      <span>{content}</span>
      <button
        onClick={closeToast}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 18,
          marginLeft: 12,
          cursor: 'pointer',
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
