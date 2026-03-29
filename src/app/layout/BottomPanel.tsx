import { useState } from 'react'

export function BottomPanel() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="bottom-panel" data-collapsed={collapsed}>
      <button className="bottom-panel__toggle" onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? 'Expand Logs' : 'Collapse Logs'}
      </button>
      {!collapsed && (
        <div className="bottom-panel__content">
          <h2>Execution & Logs</h2>
          <p>Terminal output and long-running activity will appear here in later phases.</p>
        </div>
      )}
    </div>
  )
}
