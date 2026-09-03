import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { KodingNextLogo } from './Logo';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// 1. BUTTON
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'brand-pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer';
  
  const variants = {
    primary: 'bg-[#49A5D7] hover:bg-[#338CBF] text-white focus:ring-[#49A5D7]/40 active:bg-[#25719D] shadow-md shadow-[#49A5D7]/20 hover:shadow-lg',
    'brand-pink': 'bg-[#E8579B] hover:bg-[#D23E84] text-white focus:ring-[#E8579B]/40 active:bg-[#B22769] shadow-md shadow-[#E8579B]/20 hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300 border border-gray-200',
    outline: 'border border-[#49A5D7] text-[#25719D] hover:bg-[#F0F8FC] focus:ring-[#49A5D7]/30',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-400 active:bg-rose-800 shadow-rose-600/25',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400 active:bg-emerald-800 shadow-emerald-600/25',
    ghost: 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 shadow-none',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// 2. BADGE
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple' | 'pink';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  dot = false,
}) => {
  const variants = {
    primary: 'bg-[#F0F8FC] text-[#25719D] border border-[#A6DEEF]',
    pink: 'bg-[#FDF2F8] text-[#B22769] border border-[#E9C5DE]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const dotColors = {
    primary: 'bg-[#49A5D7]',
    pink: 'bg-[#E8579B]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-gray-400',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full', variants[variant], sizes[size], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

// 3. AVATAR (Name Initial Avatar with deterministic gradients)
interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const GRADIENT_PALETTES = [
  'from-[#49A5D7] to-[#25719D] text-white', // Brand Cyan
  'from-[#E8579B] to-[#B22769] text-white', // Brand Pink
  'from-[#49A5D7] to-[#E8579B] text-white', // Brand Blue-to-Pink
  'from-indigo-500 to-purple-600 text-white',
  'from-emerald-500 to-teal-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-[#DA6F9D] to-[#E8579B] text-white', // Mid Pink to Magenta
  'from-[#49A5D7] to-[#A6DEEF] text-slate-900', // Cyan Gradient
];

export function getInitials(name: string): string {
  if (!name) return '?';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.charAt(0).toUpperCase() || '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  className,
}) => {
  const initials = getInitials(name);
  
  // Deterministic color palette based on name
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + (name || '').charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % GRADIENT_PALETTES.length;
  const gradient = GRADIENT_PALETTES[colorIndex];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] font-bold',
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-9 h-9 text-xs font-bold',
    lg: 'w-11 h-11 text-sm font-bold',
    xl: 'w-14 h-14 text-base font-extrabold',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center select-none shrink-0 shadow-xs ring-1 ring-white/20',
        gradient,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
};


// 3. CARD
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className, onClick, hoverable = false }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 transition-all duration-200',
        hoverable && 'hover:shadow-md hover:border-primary-300 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

// 4. MODAL
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  hideHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  hideHeader = false,
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full p-6 overflow-hidden border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-150',
          maxWidths[maxWidth]
        )}
      >
        {!hideHeader ? (
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">{title || ''}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-100 transition-colors shadow-xs"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        <div className="max-h-[82vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

// 5. CONFIRMATION DIALOG
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-150 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
