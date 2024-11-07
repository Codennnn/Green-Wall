import styles from './Graph.module.css'

export function GraphLegend() {
  return (
    <div className="ml-auto flex items-center text-xs">
      <span>Less</span>

      <ul className={`${styles['grids']} mx-2 grid grid-cols-5 gap-[3px]`}>
        <li className="day size-3" data-level="0" />
        <li className="day size-3" data-level="1" />
        <li className="day size-3" data-level="2" />
        <li className="day size-3" data-level="3" />
        <li className="day size-3" data-level="4" />
      </ul>

      <span>More</span>
    </div>
  )
}
