import type { ImportPreview, ParsedTransaction } from '@/types'

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

  /** Parse file bytes into an ImportPreview */
  parse(file: File): Promise<ImportPreview>
}

/** Result of a single-row parse attempt */
export type ParseRowResult =
  | { ok: true; transaction: ParsedTransaction }
  | { ok: false; reason: string }
