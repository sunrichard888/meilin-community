import * as React from "react"
import { cn } from "@/lib/utils"

const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<{
    message: string
    type: 'success' | 'error' | 'info'
    id: number
  } | null>(null)

  const showToast = React.useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now()
    setToast({ message, type, id })
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in",
            "flex items-center gap-2",
            toast.type === 'success' && "bg-green-500 text-white",
            toast.type === 'error' && "bg-destructive text-destructive-foreground",
            toast.type === 'info' && "bg-primary text-primary-foreground"
          )}
        >
          {toast.type === 'success' && <span>✓</span>}
          {toast.type === 'error' && <span>⚠</span>}
          {toast.type === 'info' && <span>ℹ</span>}
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
