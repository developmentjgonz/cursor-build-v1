import type { IntentReceipt as IntentReceiptModel } from '../../../shared/contracts/intent-receipt'

interface IntentReceiptProps {
  receipt: IntentReceiptModel
  onApprove: () => void
  isApproving?: boolean
}

export function IntentReceipt({
  receipt,
  onApprove,
  isApproving = false,
}: IntentReceiptProps) {
  const hasBlockingReasons = receipt.blockingReasons.length > 0

  return (
    <section aria-labelledby={`receipt-${receipt.id}`}>
      <header>
        <p>Intent Receipt</p>
        <h2 id={`receipt-${receipt.id}`}>{receipt.actionSummary}</h2>
      </header>

      <dl>
        <div>
          <dt>Action</dt>
          <dd>{receipt.intent.kind === 'swap' ? 'Token swap' : 'Prediction'}</dd>
        </div>
        <div>
          <dt>Estimated network fee</dt>
          <dd>{receipt.quote.estimatedFeeSol} SOL</dd>
        </div>
        <div>
          <dt>Quote expires</dt>
          <dd>{new Date(receipt.quote.expiresAt).toLocaleTimeString()}</dd>
        </div>
      </dl>

      {receipt.warnings.length > 0 ? (
        <ul aria-label="Warnings">
          {receipt.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      {hasBlockingReasons ? (
        <ul aria-label="Action blockers">
          {receipt.blockingReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        disabled={hasBlockingReasons || isApproving}
        onClick={onApprove}
      >
        {isApproving ? 'Preparing transaction…' : 'Approve and continue'}
      </button>
    </section>
  )
}
