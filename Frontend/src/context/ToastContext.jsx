/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-[90%] sm:w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 pointer-events-auto backdrop-blur-md transition-colors ${
                toast.type === "success"
                  ? "bg-zinc-950/90 border-emerald-500/30 text-emerald-450 shadow-emerald-950/20"
                  : "bg-zinc-950/90 border-rose-500/30 text-rose-450 shadow-rose-950/20"
              }`}
            >
              <div className="mt-0.5">
                {toast.type === "success" ? (
                  <CheckCircle2 className="shrink-0 text-emerald-500" size={20} />
                ) : (
                  <AlertCircle className="shrink-0 text-rose-500" size={20} />
                )}
              </div>
              <div className="flex-1 text-sm font-medium text-zinc-100">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-white transition shrink-0 cursor-pointer p-0.5 rounded-md hover:bg-zinc-800"
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
