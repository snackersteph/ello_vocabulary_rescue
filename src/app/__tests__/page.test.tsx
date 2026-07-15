import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Page from '../page'
import { COPY } from '@/domain/content'

const diagnosticLogLabel = '[reviewer-diagnostics]'

function mockFetchResponses(...responses: unknown[]) {
  const fetchMock = vi.mocked(fetch)
  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve(response),
    } as Response)
  })
}

function mockPendingFetchResponse(response: unknown) {
  let resolveResponse: (() => void) | undefined
  let capturedSignal: AbortSignal | undefined

  vi.mocked(fetch).mockImplementationOnce((_input, init) => {
    capturedSignal = init?.signal ?? undefined

    return new Promise<Response>((resolve) => {
      resolveResponse = () => resolve({
        json: () => Promise.resolve(response),
      } as Response)
    })
  })

  return {
    get signal() {
      return capturedSignal
    },
    resolve: () => {
      if (!resolveResponse) throw new Error('Pending fetch was not started')
      resolveResponse()
    },
  }
}

async function submitSpeech(text: string) {
  const input = screen.getByRole('textbox', { name: /simulated child speech input/i })
  const submit = screen.getByRole('button', { name: /submit/i })

  await act(async () => {
    fireEvent.change(input, { target: { value: text } })
  })

  await act(async () => {
    fireEvent.click(submit)
    await Promise.resolve()
    await Promise.resolve()
  })

  expect(input).toHaveValue('')
}

async function triggerMeaningStall() {
  await submitSpeech('his cozy')

  // A sustained pause (meets pauseThreshold) routes straight to the 4-event
  // classifier — no attempt-classifier call first.
  mockFetchResponses({ event: 'MEANING_STALL' })

  await submitSpeech('burrow......')

  expect(screen.getByRole('button', { name: /tap to learn what burrow means/i })).toBeInTheDocument()
}

async function advanceTimersByTime(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

function latestDiagnosticLog() {
  const consoleInfoMock = vi.mocked(console.info)
  const call = consoleInfoMock.mock.calls.findLast(([label]) => label === diagnosticLogLabel)
  if (!call) throw new Error('Expected reviewer diagnostic log')
  return call[1]
}

describe('Page timer-driven UI flows', () => {
  beforeEach(() => {
    let uuidCounter = 0
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `test-id-${uuidCounter++}`) })
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('moves from a valid burrow attempt and meaning stall to WORD_OFFER, then escalates to COMPANION_OFFER after 7 seconds', async () => {
    render(<Page />)

    await triggerMeaningStall()

    expect(screen.queryByText(COPY.offer)).not.toBeInTheDocument()

    await advanceTimersByTime(7000)

    expect(screen.getByText(`“${COPY.offer}”`)).toBeInTheDocument()
    expect(screen.getByText(`“${COPY.offer2}”`)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /tap to learn what burrow means/i })).toHaveLength(2)
  })

  it('logs classifier diagnostics after classifier calls', async () => {
    render(<Page />)

    await submitSpeech('his cozy')

    mockFetchResponses(
      { event: 'MEANING_STALL', confidence: 'MEDIUM', reasonCode: 'sustained_pause', evidence: 'burrow......', source: 'fallback' },
    )

    await submitSpeech('burrow......')

    expect(latestDiagnosticLog()).toMatchObject({
      kind: 'classify',
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'sustained_pause',
      source: 'fallback',
    })
    expect(screen.queryByRole('region', { name: /reviewer diagnostics/i })).not.toBeInTheDocument()
  })

  it.each([
    ['burrow burrow', 'word_repeated'],
    ['burrow?', 'uncertain_intonation'],
    ['burrow..............', 'sustained_stall_after_target'],
  ])('routes "%s" directly to the 4-event classifier at the target word', async (utterance, reasonCode) => {
    render(<Page />)

    await submitSpeech('his cozy')

    mockFetchResponses({
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode,
      evidence: utterance,
      source: 'fallback',
    })

    await submitSpeech(utterance)

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toBe('/api/classify')
    expect(screen.getByRole('button', { name: /tap to learn what burrow means/i })).toBeInTheDocument()

    expect(latestDiagnosticLog()).toMatchObject({
      kind: 'classify',
      event: 'MEANING_STALL',
      reasonCode,
    })
    expect(screen.queryByRole('region', { name: /reviewer diagnostics/i })).not.toBeInTheDocument()
  })

  it('accepts a clean "burrow" retry from COMPANION_OFFER as reading resumed, dismissing the offer', async () => {
    render(<Page />)

    await triggerMeaningStall()
    await advanceTimersByTime(7000)

    expect(screen.getByText(`“${COPY.offer}”`)).toBeInTheDocument()

    mockFetchResponses({ event: 'READING_RESUMED', reasonCode: 'clean_target_completion' })
    await submitSpeech('burrow')

    // Yello's transcript log keeps the earlier offer lines — dismissal is reflected
    // by the tap targets (floating word + magnifying glass) disappearing, not by the log clearing.
    expect(screen.queryByRole('button', { name: /tap to learn what burrow means/i })).not.toBeInTheDocument()
    expect(screen.getByText('burrow')).toHaveStyle({ color: '#abadad' })
  })

  it('dismisses WORD_OFFER on READING_RESUMED and does not later ghost-transition after timers advance', async () => {
    render(<Page />)

    await triggerMeaningStall()

    mockFetchResponses({ event: 'READING_RESUMED' })
    await submitSpeech('was nestled between rust-colored rocks')

    expect(screen.queryByRole('button', { name: /tap to learn what burrow means/i })).not.toBeInTheDocument()
    expect(screen.getByText('burrow')).toHaveStyle({ color: '#abadad' })
    expect(screen.getByText('rocks')).toHaveStyle({ color: '#abadad' })

    await advanceTimersByTime(20000)

    expect(screen.queryByText(`“${COPY.offer}”`)).not.toBeInTheDocument()
    expect(screen.queryByText(`“${COPY.offer2}”`)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /tap to learn what burrow means/i })).not.toBeInTheDocument()
  })

  it('enters MEANING_ACTIVITY when burrow is tapped from WORD_OFFER and cancels the escalation timer', async () => {
    render(<Page />)

    await triggerMeaningStall()

    fireEvent.click(screen.getByRole('button', { name: /tap to learn what burrow means/i }))

    expect(
      screen.getByAltText(/a burrow: a hole or tunnel in the ground where an animal lives/i),
    ).toBeInTheDocument()
    expect(screen.getByText(`“${COPY.definition}”`)).toBeInTheDocument()

    await advanceTimersByTime(7000)

    expect(screen.queryByText(`“${COPY.offer}”`)).not.toBeInTheDocument()
    expect(screen.queryByText(`“${COPY.offer2}”`)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /tap to learn what burrow means/i })).not.toBeInTheDocument()
  })

  it('auto adds the return prompt in MEANING_ACTIVITY and advances to RETURN_REREAD', async () => {
    render(<Page />)

    await triggerMeaningStall()
    fireEvent.click(screen.getByRole('button', { name: /tap to learn what burrow means/i }))

    await advanceTimersByTime(3000)

    expect(screen.getByText(`“${COPY.returnPrompt}”`)).toBeInTheDocument()

    await advanceTimersByTime(2500)

    expect(screen.queryByAltText(/a burrow: a hole or tunnel in the ground where an animal lives/i)).not.toBeInTheDocument()
    expect(screen.getByText('His')).toBeInTheDocument()
    expect(screen.getByText('cozy')).toBeInTheDocument()
    expect(screen.getByText('burrow')).toBeInTheDocument()
    expect(screen.getByText('was')).toBeInTheDocument()
    expect(screen.getByText('nestled')).toBeInTheDocument()
  })

  it('marks return-reread words complete when Brian reads the correct phrase', async () => {
    render(<Page />)

    await triggerMeaningStall()
    fireEvent.click(screen.getByRole('button', { name: /tap to learn what burrow means/i }))

    await advanceTimersByTime(5500)

    const fetchCallsBeforeReread = vi.mocked(fetch).mock.calls.length

    expect(screen.getByText('His')).toHaveStyle({ color: '#2c3232' })
    expect(screen.getByText('cozy')).toHaveStyle({ color: '#2c3232' })
    expect(screen.getByText('burrow')).toHaveStyle({ color: '#2c3232' })
    expect(screen.getByText('was')).toHaveStyle({ color: '#2c3232' })
    expect(screen.getByText('nestled')).toHaveStyle({ color: '#2c3232' })

    await submitSpeech('His cozy burrow was nestled')

    expect(vi.mocked(fetch).mock.calls.length).toBe(fetchCallsBeforeReread)
    expect(screen.getByText('His')).toHaveStyle({ color: '#abadad' })
    expect(screen.getByText('cozy')).toHaveStyle({ color: '#abadad' })
    expect(screen.getByText('burrow')).toHaveStyle({ color: '#abadad' })
    expect(screen.getByText('was')).toHaveStyle({ color: '#abadad' })
    expect(screen.getByText('nestled')).toHaveStyle({ color: '#abadad' })
  })

  it('manual reset from MEANING_ACTIVITY clears transcript and input, and prevents ghost return', async () => {
    render(<Page />)

    await triggerMeaningStall()
    fireEvent.click(screen.getByRole('button', { name: /tap to learn what burrow means/i }))

    const input = screen.getByRole('textbox', { name: /simulated child speech input/i })
    const transcriptPanel = screen.getByText('Yello').closest('div')
    expect(transcriptPanel).not.toBeNull()
    expect(input).toBeDisabled()
    expect(screen.getByText(`“${COPY.definition}”`)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reset prototype/i }))

    expect(input).not.toBeDisabled()
    expect(input).toHaveValue('')
    expect(screen.queryByText(`“${COPY.definition}”`)).not.toBeInTheDocument()
    expect(within(transcriptPanel as HTMLElement).getByText("Yello's responses will appear here.")).toBeInTheDocument()

    await advanceTimersByTime(20000)

    expect(screen.queryByAltText(/a burrow: a hole or tunnel in the ground where an animal lives/i)).not.toBeInTheDocument()
    expect(screen.queryByText(COPY.returnPhrase)).not.toBeInTheDocument()
    expect(screen.queryByText(`“${COPY.returnPrompt}”`)).not.toBeInTheDocument()
  })

  it('keeps reviewer diagnostics out of the UI after reset', async () => {
    render(<Page />)

    await submitSpeech('his cozy')

    mockFetchResponses({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })

    await submitSpeech('borrow')

    expect(latestDiagnosticLog()).toMatchObject({
      kind: 'classify-attempt',
      isValid: false,
      reasonCode: 'phonetic_substitution',
    })
    expect(screen.queryByRole('region', { name: /reviewer diagnostics/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reset prototype/i }))

    expect(screen.queryByRole('region', { name: /reviewer diagnostics/i })).not.toBeInTheDocument()
  })

  it('reset restores reading progress and burrow attempt count', async () => {
    render(<Page />)

    await submitSpeech('his cozy')

    mockFetchResponses({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })
    await submitSpeech('borrow')

    mockFetchResponses({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })
    await submitSpeech('borrow')

    const secondAttemptBody = JSON.parse(String(vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body))
    expect(secondAttemptBody.attemptCount).toBe(1)
    expect(screen.getByText('His')).toHaveStyle({ color: '#abadad' })
    expect(screen.getByText('cozy')).toHaveStyle({ color: '#abadad' })

    fireEvent.click(screen.getByRole('button', { name: /reset prototype/i }))

    expect(screen.getByText('His')).toHaveStyle({ color: '#2c3232' })
    expect(screen.getByText('cozy')).toHaveStyle({ color: '#2c3232' })
    expect(screen.queryByRole('region', { name: /reviewer diagnostics/i })).not.toBeInTheDocument()

    await submitSpeech('his cozy')

    mockFetchResponses({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })
    await submitSpeech('borrow')

    const resetAttemptBody = JSON.parse(String(vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body))
    expect(resetAttemptBody.attemptCount).toBe(0)
  })

  it('reset aborts an active request and ignores its stale response', async () => {
    render(<Page />)

    await submitSpeech('his cozy')

    const pendingAttempt = mockPendingFetchResponse({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })

    const input = screen.getByRole('textbox', { name: /simulated child speech input/i })
    const submit = screen.getByRole('button', { name: /submit/i })

    await act(async () => {
      fireEvent.change(input, { target: { value: 'borrow' } })
      fireEvent.click(submit)
      await Promise.resolve()
    })

    expect(pendingAttempt.signal).toBeDefined()
    expect(pendingAttempt.signal?.aborted).toBe(false)
    expect(input).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /reset prototype/i }))

    expect(pendingAttempt.signal?.aborted).toBe(true)
    expect(input).not.toBeDisabled()
    expect(input).toHaveValue('')

    await act(async () => {
      pendingAttempt.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.queryByRole('region', { name: /reviewer diagnostics/i })).not.toBeInTheDocument()
    expect(screen.queryByText("Burrow. Now let's keep reading.")).not.toBeInTheDocument()
    expect(screen.getByText('His')).toHaveStyle({ color: '#2c3232' })
    expect(screen.getByText('cozy')).toHaveStyle({ color: '#2c3232' })

    await submitSpeech('his cozy')

    mockFetchResponses({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
      source: 'fallback',
    })
    await submitSpeech('borrow')

    const resetAttemptBody = JSON.parse(String(vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body))
    expect(resetAttemptBody.attemptCount).toBe(0)
  })
})
