import * as React from "react"

// Simplified toast hook for auth components
export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const toasts = new Map<string, Toast>()
const listeners: Set<() => void> = new Set()

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function addToast(toast: Omit<Toast, "id">) {
  const id = genId()
  const newToast = { ...toast, id }
  toasts.set(id, newToast)
  listeners.forEach((listener) => listener())
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toasts.delete(id)
    listeners.forEach((listener) => listener())
  }, 5000)
  
  return id
}

function removeToast(id: string) {
  toasts.delete(id)
  listeners.forEach((listener) => listener())
}

export function useToast() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  React.useEffect(() => {
    listeners.add(forceUpdate)
    return () => {
      listeners.delete(forceUpdate)
    }
  }, [forceUpdate])

  return {
    toast: (props: Omit<Toast, "id">) => addToast(props),
    toasts: Array.from(toasts.values()),
    dismiss: removeToast,
  }
}