import { motion, useDragControls } from 'framer-motion'
import { useEffect, useState } from 'react'

import { iconClose } from '../icons'
import AppearanceSetting, { type AppearanceSettingProps } from './AppearanceSetting'

export default function DraggableAppearanceSetting(
  props: AppearanceSettingProps & { onClose?: () => void }
) {
  const { onClose, ...appearanceSetting } = props

  const dragControls = useDragControls()
  const [renderClientSide, setRenderClientSide] = useState(false)

  useEffect(() => {
    setRenderClientSide(true)
  }, [])

  return renderClientSide ? (
    <div className="absolute top-[35px] left-1/2 z-[99] w-[300px] -translate-x-1/2">
      <motion.div
        drag
        className="inline-block overflow-hidden rounded-lg bg-white shadow-overlay"
        dragConstraints={{ current: window.document.body }}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
      >
        <div
          className="flex min-h-[35px] cursor-grab select-none items-center bg-accent-50 px-3 text-sm font-medium text-accent-500"
          onPointerDown={(ev) => {
            dragControls.start(ev, { snapToCursor: false })
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
          >
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <span className="h-4 w-4 text-main-500">{iconClose}</span>
            </span>
          </button>
        </div>

        <div className="p-5">
          <AppearanceSetting {...appearanceSetting} />
        </div>
      </motion.div>
    </div>
  ) : null
}
