import type { ImportPreview, ParsedTransaction } from '@/types'

/** Progress of a file parse, reported in [0, 100] within each phase. */
export interface ParseProgress {
  phase: 'reading' | 'parsing'
  percent: number
}

export type ParseProgressCallback = (progress: ParseProgress) => void

/**
 * Every bank-specific (or generic) parser implements this interface.
 * The `parse` method receives raw file bytes and returns a structured preview.
 */
export interface IFileParser {
  /** Human-readable parser name, e.g. "Intesa Sanpaolo" */
  readonly name: string

  /**
   * Returns true if this parser can handle the given file.
   * Used by ParserFactory to auto-detect format.
   */
  canHandle(file: File, rawText?: string): boolean

  /**
   * Parse file bytes into an ImportPreview.
   * `onProgress` is optional — parsers should report it for large files and
   * yield to the event loop periodically so the UI can repaint.
   */
  parse(file: File, onProgress?: ParseProgressCallback): Promise<ImportPreview>
}

/** Lets the parsing loop yield so progress updates can paint. */
export const yieldToUI = () => new Promise<void>(resolve => setTimeout(resolve, 0))

/** Result of a single-row parse attempt */
export type ParseRowResult =
  | { ok: true; transaction: ParsedTransaction }
  | { ok: false; reason: string }
