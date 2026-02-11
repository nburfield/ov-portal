import React, { useState, useRef, useCallback } from 'react'
import { cn } from '../../utils/cn'

const FileUpload = ({ onFile, accept, maxSize, label, className, ...props }) => {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const validateFile = useCallback(
    (selectedFile) => {
      if (accept) {
        const acceptedTypes = Array.isArray(accept)
          ? accept
          : accept.split(',').map((type) => type.trim())
        if (!acceptedTypes.includes(selectedFile.type)) {
          return `File type not accepted. Accepted types: ${acceptedTypes.join(', ')}`
        }
      }
      if (maxSize && selectedFile.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
        return `File size exceeds ${maxSizeMB} MB`
      }
      return null
    },
    [accept, maxSize]
  )

  const handleFile = useCallback(
    (selectedFile) => {
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
        setFile(null)
      } else {
        setError('')
        setFile(selectedFile)
        onFile?.(selectedFile)
      }
    },
    [validateFile, onFile]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImage = file && file.type.startsWith('image/')

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors',
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600',
          error && 'border-red-500',
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        data-testid="file-upload-dropzone"
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        {!file ? (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop a file here, or click to browse
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {isImage ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mx-auto h-20 w-20 object-cover rounded-md"
              />
            ) : (
              <div className="text-sm text-gray-900 dark:text-gray-100">
                <p className="font-medium">{file.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                setError('')
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove file
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default FileUpload
