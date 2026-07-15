const A = {
  landscape:    '/assets/landscape-bg.svg',
  illustration: '/assets/burrow-illustration.png',
  forwardIcon:  '/assets/forward-icon.svg',
  // TODO: replace with the MEANING_ACTIVITY Yello pose (happy/waving) once asset is provided
  yello:        '/assets/yello-looking-up.svg',
}

interface Props {
  onContinue: () => void
}

export default function MeaningActivity({ onContinue }: Props) {
  return (
    <div className="relative overflow-hidden bg-white" style={{ width: 393, height: 852 }}>

      {/* Story background (visible behind the overlay) */}
      <div className="absolute inset-0 bg-[#d9d9d9]" />
      <img
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src={A.landscape}
      />

      {/* Dark teal overlay — dims story, frames teaching card */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: 'rgba(51, 92, 110, 0.75)' }}
      />

      {/* Teaching card */}
      <div
        className="absolute z-20 bg-white overflow-hidden"
        style={{
          left: 32,
          top: 131,
          width: 329,
          height: 397,
          border: '8px solid white',
          borderRadius: 40,
          boxShadow: '-3px 3px 16px 0px rgba(0,0,0,0.15), 2px 2px 3px 0px rgba(0,0,0,0.15)',
        }}
      >
        {/* Burrow illustration — overflows top of card */}
        <div style={{ position: 'absolute', left: -8, top: -20, width: 329, height: 329 }}>
          <img
            alt="A burrow: a hole or tunnel in the ground where an animal lives"
            src={A.illustration}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Target word label */}
        <p
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 332,
            textAlign: 'center',
            fontFamily: 'var(--font-mulish)',
            fontWeight: 900,
            fontSize: 40,
            lineHeight: 1.28,
            color: '#175773',
            letterSpacing: '-0.4px',
            margin: 0,
          }}
        >
          burrow
        </p>
      </div>

      {/* Yello character — peeking up below the card */}
      <div className="absolute z-20" style={{ left: 67, top: 510, width: 260, height: 325 }}>
        <img
          alt="Yello"
          src={A.yello}
          style={{
            position: 'absolute',
            width: 185.5,
            height: 216,
            left: 45,   // calc(50% + 7.75px) - 185.5/2
            top: 84,    // calc(50% + 29.5px) - 216/2
          }}
        />
      </div>

      {/* Bottom Safe Area */}
      <div className="absolute z-20 overflow-hidden" style={{ height: 34, left: 0, top: 818, width: 393 }}>
        <div
          className="absolute bg-white/60 rounded-[26px]"
          style={{ height: 6, left: 125, top: 20, width: 142 }}
        />
      </div>

      {/* Top Safe Area — white status icons over teal overlay */}
      <div className="absolute z-30" style={{ height: 59, left: 0, top: 0, width: 393 }}>
        <span
          className="absolute font-semibold"
          style={{ fontFamily: 'var(--font-mulish)', fontSize: 15, fontWeight: 600, color: 'white', left: 24, top: 19, lineHeight: 1 }}
        >
          9:41
        </span>
        <div
          className="absolute bg-[#2c3232] rounded-[26px]"
          style={{ height: 38, left: 132, top: 11, width: 128 }}
        />
        <div className="absolute flex items-center gap-1.5" style={{ right: 24, top: 20 }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="white" aria-hidden>
            <rect x="0"    y="6" width="3" height="6"  rx="0.8" />
            <rect x="4.5"  y="4" width="3" height="8"  rx="0.8" />
            <rect x="9"    y="2" width="3" height="10" rx="0.8" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.8" opacity="0.3" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
            <circle cx="8" cy="11" r="1.2" fill="white" />
            <path d="M4.8 7.8C5.7 6.9 6.8 6.4 8 6.4s2.3.5 3.2 1.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M2 4.8C3.6 3.1 5.7 2.1 8 2.1s4.4 1 6 2.7"    stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <svg width="25" height="13" viewBox="0 0 25 13" fill="none" aria-hidden>
            <rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke="white" />
            <rect x="2"   y="2"   width="16" height="9"  rx="2"   fill="white" />
            <path d="M23 4.5v4a2 2 0 0 0 0-4z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Skip → dispatches CONTINUE → RETURN_REREAD */}
      <div
        className="absolute z-30 flex items-center justify-end"
        style={{ left: 0, top: 59, width: 393, height: 64, paddingRight: 12 }}
      >
        <button
          onClick={onContinue}
          className="flex items-center gap-3 px-4 py-4"
          aria-label="Skip to return and reread"
        >
          <span
            style={{
              fontFamily: 'var(--font-mulish)',
              fontSize: 20,
              fontWeight: 400,
              color: 'white',
              lineHeight: 1,
            }}
          >
            Skip
          </span>
          <img alt="" src={A.forwardIcon} style={{ width: 32, height: 32 }} />
        </button>
      </div>

    </div>
  )
}
