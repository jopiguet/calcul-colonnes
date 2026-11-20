/**
 * The reading in Latin letters (rōmaji, a transliteration) is chosen per course (docs/vocabulary.md#the-reading-in-latin-letters):
 * a language course's vocabulary book (`course-<id>`) and its book of letters or signs (`course-<id>-letters`) share
 * one choice; any other book is a course of its own, keyed by its slug.
 */
export function readingCourse(bookSlug: string): string {
  return bookSlug.startsWith("course-") ? bookSlug.replace(/-letters$/, "") : bookSlug;
}
