/**
 * ParserFactory — auto-detects the appropriate parser for a given file.
 *
 * Parsers are tried in priority order. The first one whose `canHandle`
 * returns true is used. The GenericParser is always last as a fallback.
 */

import type { IFileParser } from './types'
import { intesaParser } from './intesaParser'
import { genericParser } from './genericParser'

// Register bank-specific parsers here, in order of priority
const PARSERS: IFileParser[] = [
  intesaParser,
  // Add more bank parsers here as they are implemented:
  // finecoBankParser,
  // unicreditParser,
  genericParser, // always last
]

export class ParserFactory {
  /**
   * Detects and returns the appropriate parser for the given file.
   * For text-based files (CSV), reads a preview to help detection.
   */
  async getParser(file: File): Promise<IFileParser> {
    let rawText: string | undefined

    // Read a text preview for content-based detection
    if (
      file.type === 'text/csv' ||
      file.name.toLowerCase().endsWith('.csv') ||
      file.name.toLowerCase().endsWith('.txt')
    ) {
      const slice = file.slice(0, 4096)
      rawText = await slice.text()
    }

    for (const parser of PARSERS) {
      if (parser.canHandle(file, rawText)) {
        return parser
      }
    }

    // Should never reach here since GenericParser always returns true
    return genericParser
  }

  /** Returns names of all registered parsers */
  getParserNames(): string[] {
    return PARSERS.map(p => p.name)
  }
}

export const parserFactory = new ParserFactory()
