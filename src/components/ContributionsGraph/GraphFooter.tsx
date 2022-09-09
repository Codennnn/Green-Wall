import { SITE_HOST } from '../../constants'

export default function GraphFooter() {
  return (
    <div className="mt-6 flex items-center justify-center whitespace-nowrap text-xs opacity-40">
      <span>Made in - </span>
      <a className="ml-1" href={SITE_HOST.HOST}>
        {SITE_HOST.HOST}.
      </a>
    </div>
  )
}
