"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in bg-card`}
            style={{
              borderColor:
                t.type === "success"
                  ? "rgba(16, 185, 129, 0.2)"
                  : t.type === "error"
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(59, 130, 246, 0.2)",
            }}
          >
            {/* Icon */}
            {t.type === "success" && (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            {t.type === "info" && (
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
            )}

            {/* Message */}
            <p className="text-sm font-medium text-foreground grow">{t.message}</p>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-foreground/40 hover:text-foreground/75 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(1rem) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
