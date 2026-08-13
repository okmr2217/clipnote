"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// ゴミ箱移動のUndoトースト（docs/design-trash.md 3-1節）で使う、base-ui
// Toastプリミティブの薄いラッパー。他の確認不要な非破壊操作（今後の
// 「元に戻す」系トースト）にも共通で使えるよう、汎用的なコンポーネントとして
// 用意する。

export const ToastProvider = ToastPrimitive.Provider

export const useToast = ToastPrimitive.useToastManager

export function Toaster() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className="fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 outline-none md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            toast={toast}
            className={cn(
              "relative flex items-start gap-3 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 shadow-lg duration-150",
              "data-starting-style:translate-y-2 data-starting-style:opacity-0",
              "data-ending-style:opacity-0",
            )}
          >
            <div className="min-w-0 flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold" />
              <ToastPrimitive.Description className="mt-0.5 text-sm text-muted-foreground" />
            </div>
            <ToastPrimitive.Action className="shrink-0 text-sm font-bold text-primary hover:underline" />
            <ToastPrimitive.Close
              aria-label="閉じる"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}
