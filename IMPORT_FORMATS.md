# Import Formats

## Architecture

The import pipeline follows a strict sequence:

```
File → Parser detection → Parsing → ImportPreview → User confirmation → Commit to DB
```

Each step is isolated: parsing never writes to the DB; only `importService.commit()` does.

---

## Supported Parsers

### Intesa Sanpaolo (`intesaParser.ts`)

**Detection:** filename contains "intesa" or "sanpaolo", OR file content contains "Data Contabile"

**Supported export versions:**

| Version | Date column | Amount columns |
|---|---|---|
| Classic | Data Contabile | Accrediti (€) + Addebiti (€) |
| Modern | Data | Importo (signed) |

**Export steps (Intesa Sanpaolo app/web):**
1. Go to your account → Movimenti
2. Click "Esporta" / "Download"
3. Choose "Excel" or "CSV"
4. Upload the downloaded file

**Italian date formats handled:** `DD/MM/YYYY`, `YYYY-MM-DD`, Excel serial numbers

**Amount normalization:** Italian thousands separator (`.`) and decimal separator (`,`) are handled. Amounts are always stored as positive numbers.

---

### Generic CSV/Excel (`genericParser.ts`)

Used as fallback when no bank-specific parser matches.

**Requirements:** The file must have a header row. You must specify a `ColumnMapping` that tells the parser which column is the date, amount, and description.

```typescript
interface ColumnMapping {
  dateColumn: string       // Header name of the date column
  amountColumn: string     // Header name of the amount column
  descriptionColumn: string
  categoryColumn?: string  // Optional
  typeColumn?: string      // Column that distinguishes income vs expense
  incomeValue?: string     // Value in typeColumn that means income (e.g. "C", "credit")
}
```

**Type detection fallback:** If no `typeColumn` is specified, the parser infers type from the sign of the raw amount value (positive = income, negative = expense).

**Date formats handled:** `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`, Excel serial

---

## Adding a New Bank Parser

1. Create `src/services/parsing/myBankParser.ts`:

```typescript
import type { IFileParser } from './types'
import type { ImportPreview } from '@/types'

export class MyBankParser implements IFileParser {
  readonly name = 'My Bank'

  canHandle(file: File, rawText?: string): boolean {
    // Return true if this parser should handle the file
    return file.name.toLowerCase().includes('mybank') || rawText?.includes('MY BANK EXPORT') === true
  }

  async parse(file: File): Promise<ImportPreview> {
    // Parse and return an ImportPreview
    // - Read the file (using XLSX or text parsing)
    // - Locate the header row
    // - Map columns to ParsedTransaction fields
    // - Return ImportPreview with transactions, source, totalCount, dateRange
  }
}

export const myBankParser = new MyBankParser()
```

2. Register in `parserFactory.ts`:

```typescript
import { myBankParser } from './myBankParser'

const PARSERS: IFileParser[] = [
  intesaParser,
  myBankParser,   // ← add here, before genericParser
  genericParser,
]
```

3. Write tests in `tests/parsing/myBankParser.test.ts`

---

## Deduplication

`importService.commit()` deduplicates against existing transactions using a composite key:

```
{date}|{amount}|{description}
```

Transactions matching an existing record are silently skipped. The import result reports how many were skipped.

This is a simple heuristic — it won't catch duplicates if the description varies between exports of the same transaction.
