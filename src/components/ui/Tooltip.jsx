import { useState } from 'react'

function Tooltip({ content, children, position = 'top' }) {
  const [show, setShow] = useState(false)
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  }
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-10 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip
