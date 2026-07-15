import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Page from '../page'
import { COPY } from '@/domain/content'

const validBurrowAttempt = { isValid: true }

function mockFetchResponses(...responses: unknown[]) {
  const fetchMock = vi.mocked(fetch)
  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve(response),
    } as Response)
  })
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

  mockFetchResponses(validBurrowAttempt, { event: 'MEANING_STALL' })

  await submitSpeech('burrow......')

  expect(screen.getByRole('button', { name: /tap to learn what burrow means/i })).toBeInTheDocument()
}

async function advanceTimersByTime(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

describe('Page timer-driven UI flows', () => {
  beforeEach(() => {
    let uuidCounter = 0
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `test-id-${uuidCounter++}`) })
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

  it('dismisses WORD_OFFER on READING_RESUMED and does not later ghost-transition after timers advance', async () => {
    render(<Page />)

    await triggerMeaningStall()

    mockFetchResponses({ event: 'READING_RESUMED' })
    await submitSpeech('was nestled between rust-colored rocks')

    expect(screen.queryByRole('button', { name: /tap to learn what burrow means/i })).not.toBeInTheDocument()

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
    expect(screen.getByText('His cozy burrow')).toBeInTheDocument()
    expect(screen.getByText('was nestled')).toBeInTheDocument()
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
})
