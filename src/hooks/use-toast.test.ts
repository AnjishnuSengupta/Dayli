import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reducer, configureToasts } from './use-toast';

describe('Toast Reducer', () => {
  const mockToast = {
    id: '123',
    open: true,
    title: 'Test Title',
    description: 'Test Description',
    onOpenChange: vi.fn()
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should add a toast and respect the limit', () => {
    const initialState = { 
      toasts: [], 
      options: { limit: 2, duration: 5000 } 
    };
    
    // Add first toast
    const stateWithOneToast = reducer(initialState, {
      type: 'ADD_TOAST',
      toast: { ...mockToast, id: '1' }
    });
    
    expect(stateWithOneToast.toasts.length).toBe(1);
    expect(stateWithOneToast.toasts[0].id).toBe('1');
    
    // Add second toast
    const stateWithTwoToasts = reducer(stateWithOneToast, {
      type: 'ADD_TOAST',
      toast: { ...mockToast, id: '2' }
    });
    
    expect(stateWithTwoToasts.toasts.length).toBe(2);
    
    // Add third toast, but limit is 2
    const stateWithLimitedToasts = reducer(stateWithTwoToasts, {
      type: 'ADD_TOAST',
      toast: { ...mockToast, id: '3' }
    });
    
    expect(stateWithLimitedToasts.toasts.length).toBe(2);
    // Should keep the newest toasts
    expect(stateWithLimitedToasts.toasts[0].id).toBe('3');
    expect(stateWithLimitedToasts.toasts[1].id).toBe('2');
  });

  it('should update an existing toast', () => {
    const initialState = { 
      toasts: [mockToast], 
      options: { limit: 1, duration: 5000 } 
    };
    
    const updatedState = reducer(initialState, {
      type: 'UPDATE_TOAST',
      toast: { id: '123', title: 'Updated Title' }
    });
    
    expect(updatedState.toasts[0].title).toBe('Updated Title');
    expect(updatedState.toasts[0].description).toBe('Test Description');
  });

  it('should dismiss a toast', () => {
    const initialState = { 
      toasts: [mockToast], 
      options: { limit: 1, duration: 5000 } 
    };
    
    const updatedState = reducer(initialState, {
      type: 'DISMISS_TOAST',
      toastId: '123'
    });
    
    expect(updatedState.toasts[0].open).toBe(false);
  });

  it('should remove a toast', () => {
    const initialState = { 
      toasts: [mockToast], 
      options: { limit: 1, duration: 5000 } 
    };
    
    const updatedState = reducer(initialState, {
      type: 'REMOVE_TOAST',
      toastId: '123'
    });
    
    expect(updatedState.toasts.length).toBe(0);
  });

  it('should update toast options', () => {
    const initialState = { 
      toasts: [], 
      options: { limit: 1, duration: 5000 } 
    };
    
    const updatedState = reducer(initialState, {
      type: 'SET_TOAST_OPTIONS',
      options: { limit: 3, duration: 10000 }
    });
    
    expect(updatedState.options.limit).toBe(3);
    expect(updatedState.options.duration).toBe(10000);
  });
});
