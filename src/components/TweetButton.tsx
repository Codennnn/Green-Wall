import splitbee from '@splitbee/web'
import Link from 'next/link'

import { iconTwitter } from './icons'

export default function TweetButton() {
  return (
    <Link passHref href="https://twitter.com">
      <a target="_blank">
        <button className="simple-button divider" onClick={() => splitbee.track('Tweet')}>
          <span className="h-[1.2rem] w-[1.2rem]">{iconTwitter}</span>
          <span>Tweet it</span>
        </button>
      </a>
    </Link>
  )
}
