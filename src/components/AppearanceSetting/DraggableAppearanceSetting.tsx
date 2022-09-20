import { motion, useDragControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { iconClose } from '../icons'
import AppearanceSetting, { type AppearanceSettingProps } from './AppearanceSetting'

export default function DraggableAppearanceSetting(
  props: AppearanceSettingProps & { onClose?: () => void }
) {
  const { onClose, ...appearanceSetting } = props

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

  return renderClientSide ? (
    <div
      ref={wrapper}
      className={`${fixed ? 'fixed' : 'absolute'} left-1/2 z-[99] w-[300px] -translate-x-1/2`}
      style={{ top }}
    >
      <motion.div
        drag
        className="fixed inline-block overflow-hidden rounded-lg bg-white shadow-overlay"
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
