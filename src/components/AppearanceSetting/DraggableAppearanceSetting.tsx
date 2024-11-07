import { useState } from 'react'

import { motion, useDragControls } from 'framer-motion'
import { XIcon } from 'lucide-react'

export function DraggableAppearanceSetting(
  props: React.PropsWithChildren<{
    initialPosition: { x: number; y: number }
    onClose?: () => void
  }>
) {
  const { children, initialPosition, onClose } = props

  const dragControls = useDragControls()

  const [pressing, setPressing] = useState(false)

  return (
    <motion.div
      drag
      animate={pressing ? 'scale' : undefined}
      className="fixed left-0 top-0 z-50 inline-block overflow-hidden rounded-lg bg-white shadow-overlay"
      dragConstraints={{ current: document.body }}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 1000, bounceDamping: 40 }}
      style={{
        translate: `${initialPosition.x}px ${initialPosition.y}px`,
      }}
      variants={{
        scale: { scale: 0.97 },
      }}
    >
      <motion.div
        className="flex min-h-10 select-none items-center bg-accent-50 px-3 font-medium text-accent-500"
        initial={{ cursor: 'grab' }}
        whileTap={{ cursor: 'grabbing' }}
        onPointerDown={(event) => {
          dragControls.start(event, { snapToCursor: false })
          setPressing(true)
        }}
        onPointerUp={() => {
          setPressing(false)
        }}
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
            <XIcon className="size-4 text-main-500" />
          </span>
        </button>
      </motion.div>

      <div className="p-5">{children}</div>
    </motion.div>
  )
}
