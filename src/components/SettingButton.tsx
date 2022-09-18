import { iconSetting } from './icons'
import { RadixPopover } from './ui-kit/RadixPopover'

export default function SettingButton(props: { content: React.ReactNode }) {
  return (
    <RadixPopover content={props.content} title="Appearance">
      <button className="simple-button">
        <span className="h-5 w-5">{iconSetting}</span>
        <span>Appearance</span>
      </button>
    </RadixPopover>
  )
}
