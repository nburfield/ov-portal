export default function FormField({ label, error, required, children, htmlFor }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}
