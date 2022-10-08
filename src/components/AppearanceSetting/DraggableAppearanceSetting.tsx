import { useEffect, useRef, useState } from 'react'

import { motion, useDragControls } from 'framer-motion'

import { iconClose } from '../icons'

export default function DraggableAppearanceSetting(
  props: React.PropsWithChildren<{ onClose?: () => void }>
) {
  const { children, onClose } = props

  const [fixed, setFixed] = useState(false)
  const [top, setTop] = useState(35)
  const wrapper = useRef<HTMLDivElement>(null)

  const dragControls = useDragControls()
  const [renderClientSide, setRenderClientSide] = useState(false)

  useEffect(() => {
    setRenderClientSide(true)
  }, [])

  useEffect(() => {
    // HACK:
    if (renderClientSide) {
      setFixed(true)
      const distanceToTop = wrapper.current?.getBoundingClientRect().top
      if (typeof distanceToTop === 'number') {
        setTop(distanceToTop)
      }
    }
  }, [renderClientSide])

  const [pressing, setPressing] = useState(false)

  return renderClientSide ? (
    <div
      ref={wrapper}
      className={`${fixed ? 'fixed' : 'absolute'} left-1/2 z-[99] w-[300px] -translate-x-1/2`}
      style={{ top }}
    >
      <motion.div
        drag
        animate={pressing ? 'scale' : undefined}
        className="absolute inline-block overflow-hidden rounded-lg bg-white shadow-overlay"
        dragConstraints={{ current: window.document.body }}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        variants={{
          scale: { scale: 0.97 },
        }}
      >
        <motion.div
          className="flex min-h-[2.5rem] select-none items-center bg-accent-50 px-3 font-medium text-accent-500"
          initial={{ cursor: 'grab' }}
          whileTap={{ cursor: 'grabbing' }}
          onPointerDown={(event) => {
            dragControls.start(event, { snapToCursor: false })
            setPressing(true)
          }}
          onPointerUp={() => setPressing(false)}
        >
          Appearance
          <button
            aria-label="Close"
            className="ml-auto hidden md:block"
            title="Close"
            onClick={() => {
              onClose?.()
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
          >
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <span className="h-4 w-4 text-main-500">{iconClose}</span>
            </span>
          </button>
        </motion.div>

        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  ) : null
}
