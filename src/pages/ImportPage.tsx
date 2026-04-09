import { useState } from 'react'
import { FileDropzone } from '@/features/import/FileDropzone'
import { ImportPreview } from '@/features/import/ImportPreview'
import { ColumnMapper } from '@/features/import/ColumnMapper'
import { importService } from '@/services/importService'
import { parserFactory } from '@/services/parsing/parserFactory'
import { genericParser } from '@/services/parsing/genericParser'
import { useUIStore } from '@/store'
import type { ColumnMapping, ImportPreview as ImportPreviewType, ParsedTransaction } from '@/types'

type ImportState = 'idle' | 'parsing' | 'needs-mapping' | 'preview' | 'done'

export function ImportPage() {
  const { showToast } = useUIStore()
  const [state, setState] = useState<ImportState>('idle')
  const [preview, setPreview] = useState<ImportPreviewType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [detectedColumns, setDetectedColumns] = useState<string[]>([])

  const handleFileSelected = async (file: File) => {
    setError(null)
    setState('parsing')
    try {
      const parser = await parserFactory.getParser(file)

      // Generic parser needs column mapping first — show the mapper UI
      if (parser === genericParser) {
        await showColumnMapper(file)
        return
      }

      try {
        // Try the detected parser (e.g. Intesa)
        const result = await parser.parse(file)
        setPreview(result)
        setState('preview')
      } catch {
        // Parser failed — fall back to manual column mapping
        await showColumnMapper(file)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setState('idle')
    }
  }

  const showColumnMapper = async (file: File) => {
    const cols = await genericParser.detectColumns(file)
    if (cols.length === 0) {
      throw new Error('No columns detected. Make sure the first row of the file contains headers.')
    }
    setDetectedColumns(cols)
    setPendingFile(file)
    setState('needs-mapping')
  }

  const handleColumnMappingConfirmed = async (mapping: ColumnMapping) => {
    if (!pendingFile) return
    setState('parsing')
    try {
      genericParser.setMapping(mapping)
      const result = await genericParser.parse(pendingFile)
      setPreview(result)
      setState('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file with selected columns')
      setState('idle')
    }
  }

  const handleConfirm = async (selected: ParsedTransaction[]) => {
    if (!preview) return
    try {
      const result = await importService.commit(preview, selected)
      showToast(
        `Imported ${result.imported} transactions` +
          (result.skipped > 0 ? `, ${result.skipped} skipped (duplicates)` : ''),
        'success',
      )
      setState('done')
    } catch (err) {
      showToast('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
    }
  }

  const reset = () => {
    setState('idle')
    setPreview(null)
    setError(null)
    setPendingFile(null)
    setDetectedColumns([])
  }

  // ── Column mapping step (generic files) ────────────────────────────────────
  if (state === 'needs-mapping') {
    return (
      <div className="flex flex-col min-h-dvh">
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Map Columns</h1>
          <p className="text-xs text-gray-400 mt-0.5">{pendingFile?.name}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ColumnMapper
            columns={detectedColumns}
            onConfirm={handleColumnMappingConfirmed}
            onCancel={reset}
          />
        </div>
      </div>
    )
  }

  // ── Preview step ───────────────────────────────────────────────────────────
  if (state === 'preview' && preview) {
    return (
      <div className="flex flex-col h-dvh">
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Review Import</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ImportPreview preview={preview} onConfirm={handleConfirm} onCancel={reset} />
        </div>
      </div>
    )
  }

  // ── Done step ──────────────────────────────────────────────────────────────
  if (state === 'done') {
    return (
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Import</h1>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl">✅</span>
          <h2 className="text-lg font-semibold text-gray-800">Import complete!</h2>
          <p className="text-sm text-gray-500">Your transactions have been saved.</p>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold"
          >
            Import another file
          </button>
        </div>
      </div>
    )
  }

  // ── Idle / parsing ─────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-4 pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Import</h1>

      <FileDropzone
        onFileSelected={handleFileSelected}
        isLoading={state === 'parsing'}
      />

      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-expense-light text-expense text-sm">
          <p className="font-medium">Parse error</p>
          <p className="mt-1 text-xs opacity-80">{error}</p>
          <button onClick={reset} className="mt-2 text-xs underline">Try again</button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Supported formats</h2>
        <div className="flex flex-col gap-2">
          {[
            { icon: '🏦', name: 'Intesa Sanpaolo', ext: 'CSV / XLS', note: 'Auto-detected' },
            { icon: '📄', name: 'Generic CSV', ext: 'CSV', note: 'Column mapping required' },
            { icon: '📊', name: 'Generic Excel', ext: 'XLSX / XLS', note: 'Column mapping required' },
          ].map(f => (
            <div key={f.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl" aria-hidden>{f.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-400">{f.ext}</p>
              </div>
              <span className="text-xs text-income font-medium">{f.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
