import {
  DollarSign,
  Landmark,
  Lock,
  ShieldCheck,
  Smile,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { Panel } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'

interface BenefitListProps {
  className?: string
}

interface Benefit {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly Icon: LucideIcon
  readonly tintClassName: string
  readonly DecorIcon?: LucideIcon
  readonly decorClassName?: string
}

const paymentMethods = [
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'apple-pay', label: 'Apple Pay' },
]

const benefits: readonly Benefit[] = [
  {
    id: 'no-seed-phrase',
    title: 'No seed phrase confusion',
    body: "Dilo uses smart, secure technology so you don't have to worry about complicated phrases.",
    Icon: Smile,
    tintClassName: 'border-mint/30 bg-mint/10 text-mint',
    DecorIcon: ShieldCheck,
    decorClassName: 'text-mint/30',
  },
  {
    id: 'your-control',
    title: 'Your wallet, your control',
    body: "You're in control. We can't move your funds — only you can.",
    Icon: Lock,
    tintClassName: 'border-aqua/30 bg-aqua/10 text-aqua',
    DecorIcon: UserRound,
    decorClassName: 'text-aqua/30',
  },
  {
    id: 'fund-with-usd',
    title: 'Fund with USD',
    body: 'Add money easily with your bank, card, or Apple Pay.',
    Icon: DollarSign,
    tintClassName: 'border-violet-neon/30 bg-violet-neon/10 text-violet-neon',
  },
]

const chipClassName =
  'inline-flex items-center gap-1 rounded-full border border-midnight-600 px-2.5 py-1 text-[0.75rem] font-bold text-faint'

export function BenefitList({ className }: BenefitListProps) {
  return (
    <Panel padding="none" className={cn('overflow-hidden', className)}>
      <ul
        aria-label="What Dilo does for you"
        className="divide-y divide-midnight-600"
      >
        {benefits.map(
          ({ id, title, body, Icon, tintClassName, DecorIcon, decorClassName }) => (
            <li key={id} className="flex items-start gap-3.5 p-4">
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-full border',
                  tintClassName,
                )}
              >
                <Icon className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="text-[0.9375rem] font-bold text-ink">{title}</h3>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                  {body}
                </p>

                {id === 'fund-with-usd' ? (
                  <ul className="mt-3 flex flex-wrap items-center gap-1.5">
                    {paymentMethods.map((method) => (
                      <li key={method.id} className={chipClassName}>
                        {method.label}
                      </li>
                    ))}
                    <li className={chipClassName}>
                      <Landmark className="size-3.5" aria-hidden="true" />
                      Bank
                    </li>
                  </ul>
                ) : null}
              </div>

              {DecorIcon ? (
                <DecorIcon
                  aria-hidden="true"
                  strokeWidth={1.6}
                  className={cn('size-8 shrink-0 self-center', decorClassName)}
                />
              ) : null}
            </li>
          ),
        )}
      </ul>
    </Panel>
  )
}
