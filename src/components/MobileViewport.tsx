import { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export default function MobileViewport({ children }: Props) {
  return (
    <div
      className="relative overflow-hidden shadow-2xl shadow-black/70 shrink-0"
      style={{
        width: 429,       // 393 screen + 2 × 18px bezel
        border: '18px solid #2c3232',
        borderRadius: 55, // outer device radius; inner screen radius ≈ 37pt
      }}
    >
      {children}
    </div>
  )
}
