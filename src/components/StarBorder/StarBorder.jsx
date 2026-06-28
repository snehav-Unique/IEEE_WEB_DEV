import React from 'react'
import './StarBorder.css'

export default function StarBorder({
  as: Component = 'div',
  className = '',
  color = '#6366f1',
  speed = '4s',
  thickness = '1.5px',
  children,
  ...rest
}) {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: thickness,
        '--border-color': color,
        '--border-speed': speed,
        ...rest.style
      }}
      {...rest}
    >
      <div className="star-border-content">
        {children}
      </div>
    </Component>
  )
}
