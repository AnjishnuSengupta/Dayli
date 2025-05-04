
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', className)}>
      <Loader2 className={cn('animate-spin text-journal-lavender', sizeMap[size])} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function FullPageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-journal-lavender" />
        <p className="mt-4 text-lg font-medium text-gray-700">{text}</p>
      </div>
    </div>
  );
}

export function LoadingButton({ 
  children, 
  loading, 
  disabled, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn('btn-primary flex items-center gap-2', className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
