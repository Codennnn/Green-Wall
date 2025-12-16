import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { motion, useDragControls } from 'framer-motion'
import { XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'

interface DraggableAppearanceSettingProps {
  initialPosition: { x: number, y: number }
  onClose?: () => void
}

export function DraggableAppearanceSetting(
  props: React.PropsWithChildren<DraggableAppearanceSettingProps>,
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
      className="fixed left-0 top-0 z-50 inline-block overflow-hidden rounded-lg bg-background shadow-muted shadow border border-border"
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
        className="flex min-h-10 select-none items-center bg-brand-background pl-3 pr-1"
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
        <span className="text-brand-foreground font-medium">{t('appearance')}</span>

        <Button
          aria-label={tCommon('close')}
          className="ml-auto text-muted-foreground"
          size="icon-sm"
          title={tCommon('close')}
          variant="ghost"
          onClick={() => {
            onClose?.()
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
        >
          <XIcon />
        </Button>
      </motion.div>

      <div className="p-4">{children}</div>
    </motion.div>
  )
}
