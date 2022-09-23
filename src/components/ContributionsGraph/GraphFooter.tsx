import { useEffect, useState } from 'react'

export default function GraphFooter() {
  const [origin, setOrigin] = useState<string>()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className="mt-6 flex items-center justify-center whitespace-nowrap text-xs opacity-40">
      <span>Made in - </span>
      <a className="ml-1" href={origin}>
        {origin}.
      </a>
    </div>
  )
}
