import i18n from 'i18next'

/**
 * Get a localized field value from a record.
 * Checks for field_lt / field_fr columns, falling back to the base field.
 * Example: getLocalizedField(product, 'title') returns product.title_lt when language is 'lt'.
 */
export function getLocalizedField(
  record: Record<string, any> | null | undefined,
  field: string
): string {
  if (!record) return ''
  const lang = i18n.language
  if (lang && lang !== 'en') {
    const localizedKey = `${field}_${lang}`
    if (record[localizedKey]) return record[localizedKey]
  }
  return record[field] || ''
}
