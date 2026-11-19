"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Toast = { id: number; text: string; undo?: () => void };
type ToastApi = { show: (text: string, undo?: () => void) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

/** Bottom-centre toast, one at a time, 4 s, optional Undo (Dev Docs board 05). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, undo?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), text, undo });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="pointer-events-auto flex items-center gap-4 rounded-full bg-forest px-5 py-3 type-label-m text-white shadow-lg"
            >
              {toast.text}
              {toast.undo && (
                <button
                  type="button"
                  className="cursor-pointer text-lime"
                  onClick={() => {
                    toast.undo?.();
                    setToast(null);
                  }}
                >
                  Undo
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
