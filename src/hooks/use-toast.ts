
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Make toast configuration customizable
export interface ToastOptions {
  /**
   * Maximum number of toasts to show at once
   * @default 1
   */
  limit?: number;
  
  /**
   * Duration in milliseconds before removing the toast
   * @default 5000
   */
  duration?: number;
}

// Default toast configuration
const DEFAULT_TOAST_LIMIT = 1;
const DEFAULT_TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  SET_TOAST_OPTIONS: "SET_TOAST_OPTIONS",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["SET_TOAST_OPTIONS"]
      options: ToastOptions
    }

interface State {
  toasts: ToasterToast[]
  options: ToastOptions
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string, options: ToastOptions) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, options.duration || DEFAULT_TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      const toastLimit = state.options.limit || DEFAULT_TOAST_LIMIT;
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, toastLimit),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effects: Add to remove queue
      if (toastId) {
        addToRemoveQueue(toastId, state.options)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id, state.options)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    case "SET_TOAST_OPTIONS":
      return {
        ...state,
        options: {
          ...state.options,
          ...action.options,
        },
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { 
  toasts: [],
  options: {
    limit: DEFAULT_TOAST_LIMIT,
    duration: DEFAULT_TOAST_REMOVE_DELAY,
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Configure toast options
function configureToasts(options: ToastOptions) {
  dispatch({
    type: "SET_TOAST_OPTIONS",
    options,
  })
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    configure: configureToasts,
  }
}

export { useToast, toast, configureToasts }

