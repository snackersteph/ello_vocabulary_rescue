import { STORY_TOKENS, TARGET_WORD_INDEX, RETURN_REREAD_START_INDEX, PARAGRAPH_BREAK_INDEX } from '@/domain/content'

const A = {
  yelloListening:   '/assets/yello-listening.svg',
  yelloLookingUp:   '/assets/yello-looking-up.svg',
  yelloHandOut:     '/assets/yellow-hand-out.svg',
  star:             '/assets/star-icon.svg',
  backGray:         '/assets/back-icon-gray.svg',
  bottomNavBg:      '/assets/bottom-nav-bg.png',
  landscape:        '/assets/landscape-bg.svg',
  backNav:          '/assets/back-nav-icon.svg',
  forwardNav:       '/assets/forward-nav-icon.svg',
  magnifyingGlass:  '/assets/magnifying-glass.png',
}

interface Props {
  yelloVariant?:        'listening' | 'lookingUp' | 'handOut'
  wordHighlighted?:     boolean   // bumps "burrow" to 28 px in story text
  showFloatingWord?:    boolean   // pulse-animated "burrow" overlay (WORD_OFFER affordance)
  onTapWord?:           () => void
  showMagnifyingGlass?: boolean  // Yello holds up magnifying glass (COMPANION_OFFER)
  onTapGlass?:          () => void
  returnHighlight?:     boolean   // highlights "His cozy burrow was nestled" (RETURN_REREAD)
  readWordCount?:       number    // how many story tokens have been successfully read (greyed out)
}

export default function StoryPage({
  yelloVariant        = 'listening',
  wordHighlighted     = false,
  showFloatingWord    = false,
  onTapWord,
  showMagnifyingGlass = false,
  onTapGlass,
  returnHighlight     = false,
  readWordCount       = 0,
}: Props) {
  const wordSize = wordHighlighted ? 28 : 24
  const yelloSrc =
    yelloVariant === 'lookingUp' ? A.yelloLookingUp :
    yelloVariant === 'handOut'   ? A.yelloHandOut :
    A.yelloListening

  return (
    <div className="relative bg-white overflow-hidden" style={{ width: 393, height: 852 }}>

      {/* ── Activity Screen Mobile ── */}
      <div className="absolute flex flex-col items-center left-0 w-[393px]" style={{ top: 59 }}>

        {/* Character Background */}
        <div className="absolute left-0 overflow-hidden w-[393px]" style={{ height: 920, top: -127 }}>
          <div className="absolute inset-0 bg-[#d9d9d9]" />
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src={A.landscape}
          />
        </div>

        {/* Top UI */}
        <div className="relative flex gap-3 items-center px-2 shrink-0 w-[393px] z-10" style={{ height: 64 }}>
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <img alt="Back" src={A.backGray} style={{ width: 32, height: 32 }} />
          </div>

          <div className="flex-1 bg-white rounded-lg flex items-center" style={{ height: 16 }}>
            <div
              className="relative rounded-lg shrink-0"
              style={{ width: 16, height: 16, border: '2px solid #28b8b8' }}
            >
              <div className="absolute inset-0 rounded-lg bg-[#28b8b8]" />
              <div className="absolute inset-0 rounded-lg" style={{ boxShadow: 'inset 2px -4px 0px rgba(255,255,255,0.5)' }} />
            </div>
          </div>

          <div className="flex gap-2 items-start shrink-0" style={{ paddingTop: 7, paddingLeft: 12, paddingRight: 12 }}>
            <img alt="Star" src={A.star} style={{ width: 28, height: 28 }} />
            <span
              className="text-[#335c6e] not-italic"
              style={{
                fontFamily: 'var(--font-luckiest-guy)',
                fontSize: 32,
                lineHeight: 1,
                letterSpacing: '0.64px',
                paddingTop: 3,
              }}
            >
              0
            </span>
          </div>
        </div>

        {/* Bottom nav bar */}
        <div
          className="absolute flex items-start justify-between overflow-hidden px-5 w-[393px] z-10"
          style={{ height: 88, left: 0, top: 705 }}
        >
          <img
            alt=""
            aria-hidden
            className="absolute object-cover pointer-events-none"
            src={A.bottomNavBg}
            style={{ height: 88, width: 513, left: '50%', top: 0, transform: 'translateX(-50%)' }}
          />
          <div className="relative shrink-0 flex items-center justify-center opacity-30" style={{ width: 64, height: 64 }}>
            <img alt="Previous" src={A.backNav} style={{ width: 32, height: 32 }} />
          </div>
          <div className="relative shrink-0" style={{ width: 64, height: 64 }} />
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <img alt="Next" src={A.forwardNav} style={{ width: 32, height: 32 }} />
          </div>
        </div>

        {/* Interaction Frame — story text + Yello */}
        <div
          className="flex flex-col items-center justify-between relative shrink-0 w-full z-10"
          style={{ height: 821, paddingLeft: 32, paddingRight: 32 }}
        >
          {/* Story text area */}
          <div className="relative w-full" style={{ flex: '1 0 0', marginBottom: -64 }}>
            <div className="absolute left-0 w-[329px]" style={{ top: 8 }}>
              <p
                className="font-semibold whitespace-pre-wrap"
                style={{
                  fontFamily: 'var(--font-mulish)',
                  fontSize: 24,
                  lineHeight: 1.8,
                  color: '#2c3232',
                  margin: 0,
                }}
              >
                {returnHighlight ? (
                  // RETURN_REREAD: prefix dimmed; reread phrase progresses word by word.
                  <>
                    <span style={{ color: '#abadad' }}>
                      {STORY_TOKENS.slice(0, RETURN_REREAD_START_INDEX).join(' ')}{' '}
                    </span>
                    {STORY_TOKENS.slice(RETURN_REREAD_START_INDEX, PARAGRAPH_BREAK_INDEX).map((token, localIdx) => {
                      const i = RETURN_REREAD_START_INDEX + localIdx
                      const color = i < readWordCount ? '#abadad' : '#2c3232'
                      return <span key={i} style={{ color }}>{token}{' '}</span>
                    })}
                  </>
                ) : (
                  // READING / WORD_OFFER / COMPANION_OFFER — word-by-word progress coloring
                  STORY_TOKENS.slice(0, PARAGRAPH_BREAK_INDEX).map((token, i) => {
                    const color = i < readWordCount ? '#abadad' : '#2c3232'
                    if (i === TARGET_WORD_INDEX) {
                      const fs = wordHighlighted ? wordSize : 24
                      if (onTapWord) {
                        return (
                          <span key={i}>
                            <button
                              onClick={onTapWord}
                              aria-label="Tap to learn what burrow means"
                              style={{
                                fontFamily: 'var(--font-mulish)',
                                fontSize: fs,
                                fontWeight: 600,
                                lineHeight: 1.8,
                                color: showFloatingWord ? 'transparent' : color,
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                              }}
                            >
                              {token}
                            </button>
                            {' '}
                          </span>
                        )
                      }
                      return <span key={i} style={{ color, fontSize: fs }}>{token}{' '}</span>
                    }
                    return <span key={i} style={{ color }}>{token}{' '}</span>
                  })
                )}
              </p>
              <p
                className="font-semibold"
                style={{ fontFamily: 'var(--font-mulish)', fontSize: 24, lineHeight: 1.8, color: '#2c3232', margin: 0 }}
              >
                {'​'}
              </p>
              <p
                className="font-semibold"
                style={{ fontFamily: 'var(--font-mulish)', fontSize: 24, lineHeight: 1.8, color: '#2c3232', margin: 0 }}
              >
                {STORY_TOKENS.slice(PARAGRAPH_BREAK_INDEX).map((token, localIdx) => {
                  const i = PARAGRAPH_BREAK_INDEX + localIdx
                  const color = i < readWordCount ? '#abadad' : '#2c3232'
                  return <span key={i} style={{ color }}>{token}{' '}</span>
                })}
              </p>
            </div>

            {/* Floating "burrow" — pulse affordance shown in WORD_OFFER */}
            {showFloatingWord && (
              <p
                onClick={onTapWord}
                aria-hidden
                className="word-pulse absolute font-semibold select-none"
                style={{
                  fontFamily: 'var(--font-mulish)',
                  fontSize: 28,
                  lineHeight: 1.8,
                  color: '#2c3232',
                  width: 164.5,
                  left: 174,
                  top: 139,
                  textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  margin: 0,
                  cursor: onTapWord ? 'pointer' : 'default',
                }}
              >
                burrow
              </p>
            )}
          </div>

          {/* Yello character */}
          <div className="relative shrink-0" style={{ height: 325, width: 260 }}>
            <img
              key={yelloSrc}
              alt="Yello"
              src={yelloSrc}
              className="yello-fade-in"
              style={{
                position: 'absolute',
                // handOut is 25 % larger and centred in the 260 px character div
                height: yelloVariant === 'handOut' ? 270 : 216,
                width:  yelloVariant === 'handOut' ? 231.875 : 185.5,
                left:   yelloVariant === 'handOut' ? 14 : 37,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            {/* Magnifying glass — COMPANION_OFFER tap target */}
            {showMagnifyingGlass && (
              <div
                onClick={onTapGlass}
                role={onTapGlass ? 'button' : undefined}
                aria-label={onTapGlass ? "Tap to learn what burrow means" : undefined}
                tabIndex={onTapGlass ? 0 : undefined}
                className="word-pulse"
                style={{
                  position: 'absolute',
                  // Position derived from hand location in yellow-hand-out.svg
                  // SVG hand centre ≈ (25, 40) in 219×179 viewBox
                  // Rendered at 231.875×270 → hand at (26.5, 60.3) from Yello origin
                  // Yello left=14 → hand absolute ≈ (40.5, 87.8) in char div
                  // Glass container scaled 25 % (114.87×116.14), centred on hand
                  left:   -17,
                  top:     30,
                  width:  114.87,
                  height: 116.14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: onTapGlass ? 'pointer' : 'default',
                }}
              >
                <div style={{ transform: 'rotate(66.03deg)' }}>
                  <img
                    alt="Magnifying glass"
                    src={A.magnifyingGlass}
                    style={{ width: 88.75, height: 86.25, objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="absolute overflow-hidden" style={{ height: 34, left: 0, top: 818, width: 393 }}>
        <div
          className="absolute bg-[#2c3232] rounded-[26px]"
          style={{ height: 6, left: 125, top: 20, width: 142 }}
        />
      </div>

      {/* Top Safe Area */}
      <div className="absolute z-20" style={{ height: 59, left: 0, top: 0, width: 393 }}>
        <span
          className="absolute font-semibold"
          style={{ fontFamily: 'var(--font-mulish)', fontSize: 15, fontWeight: 600, color: '#2c3232', left: 24, top: 19, lineHeight: 1 }}
        >
          9:41
        </span>
        <div
          className="absolute bg-[#2c3232] rounded-[26px]"
          style={{ height: 38, left: 132, top: 11, width: 128 }}
        />
        <div className="absolute flex items-center gap-1.5" style={{ right: 24, top: 20 }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="#2c3232" aria-hidden>
            <rect x="0"    y="6" width="3" height="6"  rx="0.8" />
            <rect x="4.5"  y="4" width="3" height="8"  rx="0.8" />
            <rect x="9"    y="2" width="3" height="10" rx="0.8" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.8" opacity="0.3" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
            <circle cx="8" cy="11" r="1.2" fill="#2c3232" />
            <path d="M4.8 7.8C5.7 6.9 6.8 6.4 8 6.4s2.3.5 3.2 1.4" stroke="#2c3232" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M2 4.8C3.6 3.1 5.7 2.1 8 2.1s4.4 1 6 2.7"    stroke="#2c3232" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <svg width="25" height="13" viewBox="0 0 25 13" fill="none" aria-hidden>
            <rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke="#2c3232" />
            <rect x="2"   y="2"   width="16" height="9"  rx="2"   fill="#2c3232" />
            <path d="M23 4.5v4a2 2 0 0 0 0-4z" fill="#2c3232" />
          </svg>
        </div>
      </div>

    </div>
  )
}
