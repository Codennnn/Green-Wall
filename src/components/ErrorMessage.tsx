import { type ErrorData, ErrorType } from '../types'

import TextLink from './TextLink'

export default function ErrorMessage(props: { error: ErrorData }) {
  const { error } = props

  return (
    <div className="flex flex-col items-center justify-center text-main-400/80">
      <div className="select-none py-9 text-6xl opacity-90">
        <span>¯\_(ツ)_/¯</span>
      </div>

      <div className="max-w-[min(40%,90vw)] text-center">
        {error.type === ErrorType.BadCredentials ? (
          <div className="text-center">
            You need access token to get data, please read{' '}
            <TextLink
              passHref
              className="font-bold"
              href="https://github.com/Codennnn/Green-Wall#running-locally"
              target="_blank"
            >
              this step
            </TextLink>{' '}
            to learn how to set the token correctly.
          </div>
        ) : (
          error.message ?? 'Something went wrong.'
        )}
      </div>
    </div>
  )
}
