import { WindowControls } from '../components/WindowControls/WindowControls'
import { NavigationButtons } from '../components/NavigationButtons/NavigationButtons'
import { ModeTabs } from '../components/ModeTabs/ModeTabs'

export function TopToolbar() {
  return (
    <div className="top-toolbar">
      <div className="top-toolbar__left">
        <WindowControls />
        <NavigationButtons />
      </div>
      <div className="top-toolbar__center">
        <ModeTabs />
      </div>
      <div className="top-toolbar__right">
        {/* Reserved for future controls */}
      </div>
    </div>
  )
}
