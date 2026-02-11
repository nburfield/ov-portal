function Card({ title, children, className }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 ${className || ''}`}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      )}
      {children}
    </div>
  )
}

export default Card
