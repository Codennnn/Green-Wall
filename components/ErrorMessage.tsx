import type { ErrorData } from '../types'

export default function ErrorMessage(props: Pick<ErrorData, 'tip'>) {
  return (
    <div className="flex flex-col items-center justify-center text-main-500">
      <div>¯\_(ツ)_/¯ | {'(>_<)'}</div>
      {props.tip ?? 'Something went wrong. Please try again soon.'}
    </div>
  )
}
