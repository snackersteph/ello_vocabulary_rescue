import { beforeEach, describe, expect, it, vi } from 'vitest'

const classifyBurrowAttemptMock = vi.hoisted(() => vi.fn())

vi.mock('@/server/classify-attempt', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/server/classify-attempt')>()

  return {
    ...actual,
    classifyBurrowAttempt: classifyBurrowAttemptMock,
  }
})

import { POST } from '../route'

function postJson(body: unknown): Request {
  return new Request('http://localhost/api/classify-attempt', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/classify-attempt POST', () => {
  beforeEach(() => {
    classifyBurrowAttemptMock.mockReset()
  })

  it("returns source:'fallback' when the helper/model path fails", async () => {
    classifyBurrowAttemptMock.mockRejectedValue(new Error('model unavailable'))

    const response = await POST(postJson({ utterance: 'borrow', attemptCount: 1 }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })
    expect(classifyBurrowAttemptMock).toHaveBeenCalledWith('borrow', 1)
  })

  it("returns source:'model' on a valid mocked model result", async () => {
    classifyBurrowAttemptMock.mockResolvedValue({
      isValid: true,
      confidence: 'HIGH',
      reasonCode: 'full_word_decoded',
      yelloResponse: null,
      source: 'model',
    })

    const response = await POST(postJson({ utterance: 'burrow', attemptCount: 2 }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      isValid: true,
      confidence: 'HIGH',
      reasonCode: 'full_word_decoded',
      yelloResponse: null,
      source: 'model',
    })
  })
})
