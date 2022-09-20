export default function GraphFooter() {
  return (
    <div className="mt-6 flex items-center justify-center whitespace-nowrap text-xs opacity-40">
      <span>Made in - </span>
      <a className="ml-1" href={window.location.origin}>
        {window.location.origin}.
      </a>
    </div>
  )
}
