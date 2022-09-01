import type { ErrorData } from '../types'

export default function ErrorMessage(props: Pick<ErrorData, 'message'>) {
  return (
    <div className="flex flex-col items-center justify-center text-main-400">
      <div className="select-none py-9 text-6xl text-main-300">
        <span>¯\_(ツ)_/¯</span>
        {/* <span>{'(>_<)'}</span> */}
      </div>
      {props.message ?? 'Something went wrong.'}
    </div>
  )
}
