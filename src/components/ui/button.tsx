import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        brand:
          'bg-brand text-on-brand shadow-cta transition-[filter,box-shadow] hover:brightness-108 disabled:bg-none disabled:bg-midnight-700 disabled:text-faint disabled:shadow-none',
        outline:
          'border border-midnight-500 bg-midnight-800 text-ink hover:border-aqua',
        ghost: 'text-violet-neon hover:bg-violet-neon/12',
        subtle:
          'border border-midnight-600 bg-midnight-850 text-muted hover:text-ink',
      },
      size: {
        lg: 'min-h-[54px] rounded-md px-5 text-base',
        md: 'min-h-11 rounded-md px-4 text-sm',
        sm: 'min-h-9 rounded-sm px-3 text-sm',
        icon: 'size-11 rounded-full',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'lg',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, block, asChild = false, ...props },
    ref,
  ) {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, block }), className)}
          {...props}
        />
      )
    }

    return (
      <motion.button
        ref={ref}
        type="button"
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...(props as React.ComponentProps<typeof motion.button>)}
      />
    )
  },
)

export { buttonVariants }
