/**
 * Timeout wrapper for async operations
 * Prevents infinite blocking if operations don't respond
 *
 * @param promise - The promise to wrap with timeout
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns Promise that rejects if timeout is reached
 * @throws Error with message "Request timeout" if timeout is exceeded
 *
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   supabase.auth.getUser(),
 *   3000
 * );
 * ```
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}
