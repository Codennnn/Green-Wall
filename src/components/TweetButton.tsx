import Link from 'next/link'

import { trackEvent } from '../helpers'

import { iconTwitter } from './icons'

export default function TweetButton() {
  return (
    <Link href="https://twitter.com" target="_blank">
      <button className="simple-button divider" onClick={() => trackEvent('Tweet')}>
        <span className="h-[1.2rem] w-[1.2rem]">{iconTwitter}</span>
        <span>Tweet it</span>
      </button>
    </Link>
  )
}
