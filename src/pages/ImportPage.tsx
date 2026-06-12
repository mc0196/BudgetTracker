import { useState } from 'react'
import { FileDropzone } from '@/features/import/FileDropzone'
import { ImportPreview } from '@/features/import/ImportPreview'
import { ColumnMapper } from '@/features/import/ColumnMapper'
import { ImportProgress, type ImportProgressState } from '@/features/import/ImportProgress'
import { CommittingScreen, DoneScreen, SupportedFormats } from '@/features/import/ImportScreens'
import { importService } from '@/services/importService'
import { parserFactory } from '@/services/parsing/parserFactory'
import { genericParser } from '@/services/parsing/genericParser'
import { useUIStore } from '@/store'
import { haptics } from '@/lib/haptics'
import type { ParseProgress } from '@/services/parsing/types'
import type { ColumnMapping, ImportPreview as ImportPreviewType, ParsedTransaction } from '@/types'

type ImportState = 'idle' | 'parsing' | 'needs-mapping' | 'preview' | 'committing' | 'done'

const PARSE_LABELS: Record<ParseProgress['phase'], string> = {
  reading: 'Reading file…',
  parsing: 'Parsing transactions…',
}

export function ImportPage() {
  const { showToast } = useUIStore()
  const [state, setState] = useState<ImportState>('idle')
  const [preview, setPreview] = useState<ImportPreviewType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [detectedColumns, setDetectedColumns] = useState<string[]>([])
  const [progress, setProgress] = useState<ImportProgressState | null>(null)

  const onParseProgress = (p: ParseProgress) =>
    setProgress({ label: PARSE_LABELS[p.phase], percent: p.percent })

  const handleFileSelected = async (file: File) => {
    setError(null)
    setProgress(null)
    setState('parsing')
    try {
      const parser = await parserFactory.getParser(file)

      if (parser === genericParser) {
        await showColumnMapper(file)
        return
      }

      try {
        const result = await parser.parse(file, onParseProgress)
        setPreview(result)
        setState('preview')
      } catch {
        await showColumnMapper(file)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setState('idle')
    } finally {
      setProgress(null)
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
    setProgress(null)
    setState('parsing')
    try {
      genericParser.setMapping(mapping)
      const result = await genericParser.parse(pendingFile, onParseProgress)
      setPreview(result)
      setState('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file with selected columns')
      setState('idle')
    } finally {
      setProgress(null)
    }
  }

  const handleConfirm = async (selected: ParsedTransaction[]) => {
    if (!preview) return
    setProgress(null)
    setState('committing')
    try {
      const result = await importService.commit(preview, selected, p =>
        setProgress({
          label: p.phase === 'categorizing' ? 'Applying categories…' : 'Saving transactions…',
          percent: p.percent,
        }),
      )
      haptics.success()
      showToast(
        `Imported ${result.imported} transactions` +
          (result.skipped > 0 ? `, ${result.skipped} skipped (duplicates)` : ''),
        'success',
      )
      setState('done')
    } catch (err) {
      haptics.error()
      showToast('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error')
      setState('preview')
    } finally {
      setProgress(null)
    }
  }

  const reset = () => {
    setState('idle')
    setPreview(null)
    setError(null)
    setPendingFile(null)
    setDetectedColumns([])
    setProgress(null)
  }

  // ── Committing step ────────────────────────────────────────────────────────
  if (state === 'committing') {
    return <CommittingScreen progress={progress} />
  }

  // ── Column mapping step ────────────────────────────────────────────────────
  if (state === 'needs-mapping') {
    return (
      <div className="flex flex-col min-h-dvh">
        <div className="px-4 py-4 bg-white dark:bg-[#1a1a28] border-b border-gray-100 dark:border-white/[0.08]">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Map Columns</h1>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{pendingFile?.name}</p>
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
        <div className="px-4 py-4 bg-white dark:bg-[#1a1a28] border-b border-gray-100 dark:border-white/[0.08]">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Review Import</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ImportPreview preview={preview} onConfirm={handleConfirm} onCancel={reset} />
        </div>
      </div>
    )
  }

  // ── Done step ──────────────────────────────────────────────────────────────
  if (state === 'done') {
    return <DoneScreen onReset={reset} />
  }

  // ── Idle / parsing ─────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-4 pb-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Import</h1>

      <FileDropzone
        onFileSelected={handleFileSelected}
        isLoading={state === 'parsing'}
      />

      {state === 'parsing' && progress && (
        <ImportProgress label={progress.label} percent={progress.percent} />
      )}

      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-expense-light dark:bg-expense-subtle text-expense dark:text-expense-bright text-sm">
          <p className="font-medium">Parse error</p>
          <p className="mt-1 text-xs opacity-80">{error}</p>
          <button onClick={reset} className="mt-2 text-xs underline">Try again</button>
        </div>
      )}

      <SupportedFormats />
    </div>
  )
}
