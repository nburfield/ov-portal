import { describe, it, expect } from 'vitest'
import { parseRRule, buildRRule, rruleToHumanReadable, getOccurrences } from '../src/utils/rrule.js'
import { format } from 'date-fns'

describe('rrule utility', () => {
  it('should parse RRULE string', () => {
    const rruleString = 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,FR'
    const result = parseRRule(rruleString)
    expect(result.freq).toBe(2) // RRule.WEEKLY
    expect(result.interval).toBe(2)
    expect(result.byDay).toEqual(['MO', 'FR'])
  })

  it('should build RRULE string', () => {
    const options = {
      freq: 2, // WEEKLY
      interval: 2,
      byDay: ['MO', 'FR'],
    }
    const result = buildRRule(options)
    expect(result).toContain('FREQ=WEEKLY')
    expect(result).toContain('INTERVAL=2')
    expect(result).toContain('BYDAY=MO,FR')
  })

  it('should convert to human readable', () => {
    const rruleString = 'FREQ=WEEKLY;BYDAY=MO,FR'
    const result = rruleToHumanReadable(rruleString)
    expect(result).toBe('every week on Monday, Friday')
  })

  it('should get occurrences', () => {
    const rruleString = 'FREQ=WEEKLY;BYDAY=MO'
    const startDate = new Date(2023, 0, 2) // Jan 2, 2023, Monday
    const count = 3
    const occurrences = getOccurrences(rruleString, startDate, count)
    expect(occurrences).toHaveLength(3)
    // First occurrence should be Monday Jan 2, 2023
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2023-01-02')
  })
})
