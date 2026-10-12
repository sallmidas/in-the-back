export const NAME_BLOCK_MESSAGE: string
export function personalNameHit(text: string): string | null
export function filingNameError(fields: {
  context?: string
  excerpt?: string
  city?: string
  region?: string
  workplaceName?: string
}): string | null
