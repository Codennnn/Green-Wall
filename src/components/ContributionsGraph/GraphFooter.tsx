const href = 'https://green-wall.vercle.app'

export default function GraphFooter() {
  return (
    <div className="mt-6 flex items-center justify-center whitespace-nowrap text-xs opacity-40">
      <span>Made in - </span>
      <a className="ml-1" href={href}>
        {href}.
      </a>
    </div>
  )
}
