import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileSelected: (file: File) => void
  isLoading?: boolean
}

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls', '.txt']

export function FileDropzone({ onFileSelected, isLoading = false }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_TYPES.includes(ext)) {
      alert(`Unsupported file type. Please upload: ${ACCEPTED_TYPES.join(', ')}`)
      return
    }
    onFileSelected(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50',
        isLoading && 'opacity-50 cursor-not-allowed',
      )}
      onClick={() => !isLoading && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="text-4xl mb-3" aria-hidden>
        {isLoading ? '⏳' : '📂'}
      </div>
      <p className="text-sm font-medium text-gray-700">
        {isLoading ? 'Parsing file…' : 'Drop your bank export here'}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        or tap to browse &middot; {ACCEPTED_TYPES.join(', ')}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        Supports: Intesa Sanpaolo, generic CSV/Excel
      </p>
    </div>
  )
}
