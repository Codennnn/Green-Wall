import { iconSetting } from './icons'
import Popover from './kit/Popover'

export default function SettingButton(props: { content: React.ReactNode }) {
  return (
    <Popover
      content={
        <div className="max-w-[90vw] rounded-md bg-white pt-5 md:max-w-[50vw]">{props.content}</div>
      }
      title="Style Sreferences"
    >
      <button className="text-button">
        <span className="h-5 w-5">{iconSetting}</span>
        <span>Appearance</span>
      </button>
    </Popover>
  )
}
