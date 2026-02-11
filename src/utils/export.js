/**
 * Utility functions for exporting data to CSV and PDF formats.
 */

/**
 * Exports data to CSV format and triggers download.
 * @param {Array<Object>} data - Array of data objects
 * @param {Array<{accessorKey: string, header: string}>} columns - Column definitions
 * @param {string} filename - Name of the file to download (without extension)
 */
export function exportToCSV(data, columns, filename) {
  if (!data || !Array.isArray(data) || !columns || !Array.isArray(columns)) {
    throw new Error('Invalid data or columns provided')
  }

  const headers = columns.map((col) => col.header).join(',')
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.accessorKey]
        // Escape commas and quotes in CSV
        const stringValue = String(value || '')
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(',')
  )

  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exports data to PDF format by opening a print dialog with formatted table.
 * @param {Array<Object>} data - Array of data objects
 * @param {Array<{accessorKey: string, header: string}>} columns - Column definitions
 * @param {string} filename - Suggested name for the file (used in print dialog)
 */
export function exportToPDF(data, columns, filename) {
  if (!data || !Array.isArray(data) || !columns || !Array.isArray(columns)) {
    throw new Error('Invalid data or columns provided')
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups for this website to export PDF.')
    return
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${columns.map((col) => `<td>${row[col.accessorKey] || ''}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
