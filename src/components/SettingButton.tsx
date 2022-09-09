import { iconSetting } from './icons'
import Popover from './Popover'

export default function SettingButton(props: { content: React.ReactNode }) {
  return (
    <Popover
      content={
        <div className="max-w-[90vw] rounded-md bg-white py-3 px-4 shadow-overlay md:max-w-[50vw]">
          {props.content}
        </div>
      }
      offset={15}
    >
      <button className="simple-button">
        <span className="h-5 w-5">{iconSetting}</span>
        <span>Appearance</span>
      </button>
    </Popover>
  )
}
