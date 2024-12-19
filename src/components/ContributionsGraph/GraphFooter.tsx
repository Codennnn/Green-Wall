import { useEffect, useState } from 'react'

export function GraphFooter() {
  const [origin, setOrigin] = useState<string>()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className="flex items-center justify-end whitespace-nowrap text-xs opacity-40">
      <span>Made in - </span>
      <a className="ml-1" href={origin}>
        {origin}
      </a>
    </div>
  )
}
