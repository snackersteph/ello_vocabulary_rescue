import { afterEach, describe, expect, it, vi } from 'vitest'

function mockAnthropicCreate(createMock: ReturnType<typeof vi.fn>) {
  vi.doMock('@anthropic-ai/sdk', () => ({
    default: class MockAnthropic {
      messages = {
        create: createMock,
      }
    },
  }))
}

function createAbortableAnthropicCall() {
  return vi.fn((_payload: unknown, options?: { signal?: AbortSignal }) => (
    new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => {
        reject(new Error('request aborted'))
      })
    })
  ))
}

describe('Anthropic classifier timeout handling', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.doUnmock('@anthropic-ai/sdk')
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('aborts classify() after the timeout window', async () => {
    vi.useFakeTimers()
    vi.resetModules()

    const createMock = createAbortableAnthropicCall()
    mockAnthropicCreate(createMock)

    const { classify } = await import('../classifier')
    const result = classify('burrow......')
    const assertion = expect(result).rejects.toThrow('request aborted')

    await vi.advanceTimersByTimeAsync(5000)

    await assertion
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'burrow......' }],
      }),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it('falls back when classifyBurrowAttempt() times out', async () => {
    vi.useFakeTimers()
    vi.resetModules()

    const createMock = createAbortableAnthropicCall()
    mockAnthropicCreate(createMock)

    const { classifyBurrowAttempt } = await import('../classify-attempt')
    const result = classifyBurrowAttempt('borrow', 2)

    await vi.advanceTimersByTimeAsync(5000)

    await expect(result).resolves.toEqual({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [expect.objectContaining({ role: 'user' })],
      }),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })
})
