export default function FormField({ label, error, required, children, htmlFor }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary mb-1">
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-danger text-sm mt-1" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}
