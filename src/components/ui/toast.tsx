import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { useFlowAppearance } from '@/lib/cojeev-motion/use-flow'
import { useMorph } from '@/lib/cojeev-motion/use-morph'
import * as Primitive from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, X } from 'lucide-react'
import type { ComponentProps } from 'react'

const toastVariants = cva(
  'v-toast [display:flex] [align-items:center] [gap:var(--s-3)] [padding:var(--s-3)_var(--s-4)] [border-radius:var(--r-card-sm)] [background:var(--v-ink)] [color:var(--v-on-ink)] [font-size:var(--fs-control)]',
  {
    variants: { variant: { default: '', cream: '-cream', danger: '-danger' } },
    defaultVariants: { variant: 'default' },
  },
)

export type ToastProviderProps = ComponentProps<typeof Primitive.Provider>

export function ToastProvider({ duration = 2000, ...props }: ToastProviderProps) {
  return <Primitive.Provider duration={duration} {...props} />
}

export type ToastViewportProps = ComponentProps<typeof Primitive.Viewport>

export function ToastViewport({ className, ...props }: ToastViewportProps) {
  return (
    <Primitive.Viewport
      data-slot="toast-viewport"
      data-part="viewport"
      className={cn(
        'v-toaster v-toast-app fixed z-[var(--z-toast)] grid gap-[var(--s-2)]',
        className,
      )}
      {...props}
    />
  )
}

export type ToastProps = ComponentProps<typeof Primitive.Root> &
  VariantProps<typeof toastVariants> & {
    durable?: boolean
    appearance?: 'compact' | 'actionable' | 'receipt'
  }

export function Toast({
  className,
  variant,
  appearance = 'compact',
  durable,
  duration = 2000,
  ref,
  ...props
}: ToastProps) {
  const morphRef = useMorph<HTMLLIElement>('surfaces', ref)
  const flowRef = useFlowAppearance<HTMLLIElement>(props.open ?? true, morphRef, 'enter')
  return (
    <Primitive.Root
      ref={flowRef}
      data-slot="toast"
      data-part="root"
      data-appearance={appearance}
      duration={durable ? Infinity : duration}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
}

export type ToastTitleProps = ComponentProps<typeof Primitive.Title>

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <Primitive.Title
      data-slot="toast-title"
      data-part="title"
      className={cn('font-medium', className)}
      {...props}
    />
  )
}

export type ToastDescriptionProps = ComponentProps<typeof Primitive.Description>

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <Primitive.Description
      data-slot="toast-description"
      data-part="description"
      className={cn('flex-1', className)}
      {...props}
    />
  )
}

export type ToastActionProps = ComponentProps<typeof Primitive.Action>

export function ToastAction({ className, asChild, children, ...props }: ToastActionProps) {
  if (asChild) {
    return (
      <Primitive.Action data-slot="toast-action" data-part="action" className={className} {...props}>
        {children}
      </Primitive.Action>
    )
  }
  return (
    <Primitive.Action asChild data-slot="toast-action" data-part="action" className={className} {...props}>
      <Button variant="line">{children}</Button>
    </Primitive.Action>
  )
}

export type ToastCloseProps = ComponentProps<typeof Primitive.Close>

export function ToastClose({ className, children, asChild, ...props }: ToastCloseProps) {
  if (asChild) {
    return (
      <Primitive.Close data-slot="toast-close" data-part="close" className={className} {...props}>
        {children}
      </Primitive.Close>
    )
  }
  return (
    <Primitive.Close
      asChild
      data-slot="toast-close"
      data-part="close"
      aria-label="Cerrar aviso"
      {...props}
    >
      <button type="button" className={cn('v-btn', className)}>
        {children ?? <X aria-hidden className="size-4" />}
      </button>
    </Primitive.Close>
  )
}

export function ToastIndicator({
  className,
  tone = 'ok',
  ...props
}: ComponentProps<'span'> & { tone?: 'ok' | 'danger' }) {
  const Icon = tone === 'danger' ? X : Check
  return (
    <span
      data-slot="toast-indicator"
      data-tone={tone}
      aria-hidden
      className={cn('v-toast__indicator', className)}
      {...props}
    >
      <Icon className="size-4" />
    </span>
  )
}
