import * as React from "react"
import { cn } from "@/lib/utils/cn"

const Sheet = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => onOpenChange?.(false)} 
      />
      {/* Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-[300px] flex-col bg-slate-950 border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 ease-out">
        {children}
      </div>
    </div>
  )
}

const SheetContent = ({ children, className }) => {
  return <div className={cn("h-full flex flex-col", className)}>{children}</div>
}

const SheetTrigger = ({ children, asChild, ...props }) => {
  return <>{children}</>
}

export { Sheet, SheetContent, SheetTrigger }
