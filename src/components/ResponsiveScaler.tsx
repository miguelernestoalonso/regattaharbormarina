
import React, { useEffect, useRef, useState } from 'react'

/**
 * Scales its children down to fit available width (no horizontal scroll).
 * Base width is the natural width of the grid measured on first render.
 */
export default function ResponsiveScaler({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function recalc() {
      const outer = outerRef.current
      const inner = innerRef.current
      if (!outer || !inner) return
      // natural width before scaling
      const naturalWidth = inner.scrollWidth / scale
      const available = outer.clientWidth
      const nextScale = Math.min(1, available / naturalWidth)
      if (Math.abs(nextScale - scale) > 0.005) {
        setScale(nextScale)
      }
    }
    recalc()
    const ro = new ResizeObserver(recalc)
    if (outerRef.current) ro.observe(outerRef.current)
    window.addEventListener('resize', recalc)
    return () => {
      window.removeEventListener('resize', recalc)
      ro.disconnect()
    }
  }, [scale])

  return (
    <div ref={outerRef} className="scaler-outer">
      <div ref={innerRef} className="scaler-inner" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
