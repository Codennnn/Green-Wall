import type { ErrorData } from '../types'

export default function ErrorMessage(props: Pick<ErrorData, 'message'>) {
  return (
    <div className="flex flex-col items-center justify-center text-main-400 text-opacity-80">
      <div className="select-none py-9 text-6xl opacity-90">
        <span>¯\_(ツ)_/¯</span>
        {/* <span>{'(>_<)'}</span> */}
      </div>

      <div className="max-w-[min(40%,90vw)] text-center">
        {props.message ?? 'Something went wrong.'}
      </div>
    </div>
  )
}
