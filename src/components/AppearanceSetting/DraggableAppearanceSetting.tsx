import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { motion, useDragControls } from 'framer-motion'
import { XIcon } from 'lucide-react'

export function DraggableAppearanceSetting(
  props: React.PropsWithChildren<{
    initialPosition: { x: number, y: number }
    onClose?: () => void
  }>,
) {
  const { children, initialPosition, onClose } = props
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const dragControls = useDragControls()

  const [pressing, setPressing] = useState(false)

  return (
    <motion.div
      drag
      animate={pressing ? 'scale' : undefined}
      className="fixed left-0 top-0 z-50 inline-block overflow-hidden rounded-lg bg-background shadow-muted shadow border border-brand-900/10"
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
        className="flex min-h-10 select-none items-center bg-brand-50 px-3 font-medium text-brand-500"
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
        {t('appearance')}
        <button
          aria-label={tCommon('close')}
          className="ml-auto hidden md:block"
          title={tCommon('close')}
          onClick={() => {
            onClose?.()
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
        >
          <span className="inline-flex items-center justify-center rounded p-[0.3rem] text-main-500 transition-colors duration-200 hover:bg-red-100 hover:text-red-500">
            <XIcon className="size-4" />
          </span>
        </button>
      </motion.div>

      <div className="p-5">{children}</div>
    </motion.div>
  )
}
