function Card({ title, children, className }) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm p-4 ${className || ''}`}>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  )
}

export default Card
