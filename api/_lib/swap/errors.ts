export class SwapServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'SwapServiceError'
  }
}

export function isSwapServiceError(error: unknown): error is SwapServiceError {
  return error instanceof SwapServiceError
}
