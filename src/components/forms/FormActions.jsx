export default function FormActions({ onCancel, onSubmit, isSubmitting, submitLabel = 'Save' }) {
  return (
    <div className="sticky bottom-0 bg-bg-card border-t border-border px-6 py-4 flex justify-end space-x-3 shadow-lg">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-text-primary bg-bg-card hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  )
}
