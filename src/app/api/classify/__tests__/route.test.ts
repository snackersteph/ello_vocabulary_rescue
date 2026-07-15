import { describe, expect, it, vi, beforeEach } from 'vitest'

const classifyMock = vi.hoisted(() => vi.fn())

vi.mock('@/server/classifier', () => ({
  classify: classifyMock,
}))

import { POST } from '../route'

function postJson(body: unknown): Request {
  return new Request('http://localhost/api/classify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/classify POST', () => {
  beforeEach(() => {
    classifyMock.mockReset()
  })

  it("falls back with source:'fallback' when classifyWithModel throws", async () => {
    classifyMock.mockRejectedValue(new Error('model unavailable'))

    const response = await POST(postJson({ utterance: '' }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      event: 'NO_RELEVANT_SIGNAL',
      confidence: 'HIGH',
      reasonCode: 'empty_input',
      evidence: '(empty)',
      source: 'fallback',
    })
    expect(classifyMock).toHaveBeenCalledWith('')
  })

  it("preserves source:'model' for valid mocked model output", async () => {
    classifyMock.mockResolvedValue({
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'uncertain_intonation',
      evidence: 'burrow?',
    })

    const response = await POST(postJson({ utterance: 'burrow?' }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'uncertain_intonation',
      evidence: 'burrow?',
      source: 'model',
    })
  })

  it("falls back with source:'fallback' when mocked classifier returns an invalid shape", async () => {
    classifyMock.mockResolvedValue({
      event: 'NOT_A_READING_EVENT',
      confidence: 'HIGH',
      reasonCode: '',
      evidence: '',
    })

    const response = await POST(postJson({ utterance: 'b-u-r' }) as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      event: 'DECODING_INCOMPLETE',
      confidence: 'HIGH',
      reasonCode: 'hyphenated_attempt_no_completion',
      evidence: 'b-u-r',
      source: 'fallback',
    })
  })
})
