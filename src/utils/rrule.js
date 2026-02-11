import { RRule, Weekday } from 'rrule'

// Mapping for weekdays
const weekdayMap = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
}

const weekdayToString = (wd) => {
  const num = typeof wd === 'number' ? wd : wd.weekday
  return ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][num]
}

/**
 * Parses an iCalendar RRULE string into an object.
 * @param {string} rruleString - The RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
 * @returns {object} - Object with freq, interval, byDay, until, count
 */
export function parseRRule(rruleString) {
  const rule = RRule.fromString(rruleString)
  const options = rule.options

  return {
    freq: options.freq,
    interval: options.interval,
    byDay: options.byweekday ? options.byweekday.map((wd) => weekdayToString(wd)) : undefined,
    until: options.until,
    count: options.count,
  }
}

/**
 * Builds an RRULE string from an options object.
 * @param {object} options - Object with freq, interval, byDay, until, count
 * @returns {string} - The RRULE string
 */
export function buildRRule(options) {
  const ruleOptions = {
    freq: options.freq,
    interval: options.interval || 1,
    byweekday: options.byDay ? options.byDay.map((day) => weekdayMap[day]) : undefined,
    until: options.until,
    count: options.count,
  }

  const rule = new RRule(ruleOptions)
  return rule.toString()
}

/**
 * Converts an RRULE string to a human-readable description.
 * @param {string} rruleString - The RRULE string
 * @returns {string} - Human-readable string
 */
export function rruleToHumanReadable(rruleString) {
  const rule = RRule.fromString(rruleString)
  return rule.toText()
}

/**
 * Generates the next N occurrence dates based on RRULE and start date.
 * @param {string} rruleString - The RRULE string
 * @param {Date} startDate - The start date
 * @param {number} count - Number of occurrences to generate
 * @returns {Date[]} - Array of occurrence dates
 */
export function getOccurrences(rruleString, startDate, count) {
  const options = RRule.parseString(rruleString)
  const rule = new RRule({ ...options, dtstart: startDate })
  return rule.all().slice(0, count)
}
