import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import Button from './Button';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size       = 'md',
  closeable  = true,
  className  = '',
}) => {
  /* Lock body scroll */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return ()   => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* ESC key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && closeable) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeable, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeable ? onClose : undefined}
      />

      {/* Modal box */}
      <div
        className={[
          'relative w-full bg-brand-surface border border-brand-border rounded-2xl shadow-card',
          'animate-scale-in flex flex-col max-h-[90vh]',
          sizeMap[size] || sizeMap.md,
          className,
        ].join(' ')}
      >
        {/* Header */}
        {(title || closeable) && (
          <div className="flex items-center justify-between p-5 border-b border-brand-border flex-shrink-0">
            {title && (
              <h3 className="font-display text-lg font-bold text-white">{title}</h3>
            )}
            {closeable && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-border transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-brand-border flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* Confirm dialog shortcut */
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    <p className="text-gray-300 font-body">{message}</p>
  </Modal>
);

export default Modal;
