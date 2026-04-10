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
    e.target.value = ''
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer',
        isDragging
          ? 'border-primary-400 bg-primary-50 dark:bg-primary-400/10 scale-[1.01]'
          : 'border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.03] hover:border-primary-300 dark:hover:border-primary-400/40',
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

      {/* Icon */}
      <div className={cn(
        'mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center',
        isLoading
          ? 'bg-primary-100 dark:bg-primary-400/15'
          : isDragging
          ? 'bg-primary-100 dark:bg-primary-400/20'
          : 'bg-gray-100 dark:bg-white/[0.06]',
      )}>
        {isLoading ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-primary-500 dark:text-primary-400 animate-spin" style={{ animationDuration: '1.5s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={cn('w-8 h-8', isDragging ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500')}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        )}
      </div>

      <p className="text-base font-semibold text-gray-800 dark:text-slate-200">
        {isLoading ? 'Parsing file…' : 'Import bank statement'}
      </p>
      <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
        {isLoading ? 'Please wait' : 'Drag & drop or tap to browse'}
      </p>
      {!isLoading && (
        <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold shadow-sm shadow-primary-500/30">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Choose file
        </div>
      )}
      <p className="text-xs text-gray-300 dark:text-slate-600 mt-3">
        CSV · XLSX · XLS · TXT
      </p>
    </div>
  )
}
