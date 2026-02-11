import React, { useState, useEffect } from 'react'
import { RRule } from 'rrule'
import { parseRRule, buildRRule, rruleToHumanReadable } from '../../utils/rrule'
import Select from '../ui/Select'
import Input from '../ui/Input'
import DatePicker from '../ui/DatePicker'

const RRuleBuilder = ({ value, onChange }) => {
  const [options, setOptions] = useState({
    freq: RRule.DAILY,
    interval: 1,
    byDay: [],
    bymonthday: 1,
    endType: 'never',
    count: 1,
    until: '',
  })

  useEffect(() => {
    if (value) {
      try {
        const parsed = parseRRule(value)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOptions({
          freq: parsed.freq,
          interval: parsed.interval || 1,
          byDay: parsed.byDay || [],
          bymonthday: parsed.bymonthday || 1,
          endType: parsed.until ? 'until' : parsed.count ? 'count' : 'never',
          count: parsed.count || 1,
          until: parsed.until ? parsed.until.toISOString().split('T')[0] : '',
        })
      } catch (e) {
        console.error('Invalid RRULE:', e)
      }
    }
  }, [value])

  const updateOptions = (newOptions) => {
    const updated = { ...options, ...newOptions }
    setOptions(updated)
    try {
      const rruleString = buildRRule({
        freq: updated.freq,
        interval: updated.interval,
        byDay: updated.freq === RRule.WEEKLY ? updated.byDay : undefined,
        bymonthday: updated.freq === RRule.MONTHLY ? updated.bymonthday : undefined,
        until: updated.endType === 'until' ? new Date(updated.until) : undefined,
        count: updated.endType === 'count' ? updated.count : undefined,
      })
      onChange(rruleString)
    } catch (error) {
      console.error('Error building RRULE:', error)
    }
  }

  const freqOptions = [
    { value: RRule.DAILY, label: 'Daily' },
    { value: RRule.WEEKLY, label: 'Weekly' },
    { value: RRule.MONTHLY, label: 'Monthly' },
  ]

  const endOptions = [
    { value: 'never', label: 'Never' },
    { value: 'count', label: 'After occurrences' },
    { value: 'until', label: 'On date' },
  ]

  const weekdays = [
    { key: 'MO', label: 'Mon' },
    { key: 'TU', label: 'Tue' },
    { key: 'WE', label: 'Wed' },
    { key: 'TH', label: 'Thu' },
    { key: 'FR', label: 'Fri' },
    { key: 'SA', label: 'Sat' },
    { key: 'SU', label: 'Sun' },
  ]

  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString(),
  }))

  const handleDayChange = (day, checked) => {
    const newByDay = checked ? [...options.byDay, day] : options.byDay.filter((d) => d !== day)
    updateOptions({ byDay: newByDay })
  }

  let preview = ''
  try {
    const rruleString = buildRRule({
      freq: options.freq,
      interval: options.interval,
      byDay: options.freq === RRule.WEEKLY ? options.byDay : undefined,
      bymonthday: options.freq === RRule.MONTHLY ? options.bymonthday : undefined,
      until: options.endType === 'until' ? new Date(options.until) : undefined,
      count: options.endType === 'count' ? options.count : undefined,
    })
    preview = rruleToHumanReadable(rruleString)
  } catch {
    preview = 'Invalid recurrence rule'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Frequency"
          options={freqOptions}
          value={options.freq}
          onChange={(e) => updateOptions({ freq: parseInt(e.target.value) })}
        />
        <Input
          label="Every"
          type="number"
          min="1"
          value={options.interval}
          onChange={(e) => updateOptions({ interval: parseInt(e.target.value) || 1 })}
        />
      </div>

      {options.freq === RRule.WEEKLY && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Days of the week
          </label>
          <div className="flex flex-wrap gap-2">
            {weekdays.map((day) => (
              <label key={day.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.byDay.includes(day.key)}
                  onChange={(e) => handleDayChange(day.key, e.target.checked)}
                  className="mr-2"
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {options.freq === RRule.MONTHLY && (
        <Select
          label="Day of month"
          options={dayOptions}
          value={options.bymonthday}
          onChange={(e) => updateOptions({ bymonthday: parseInt(e.target.value) })}
        />
      )}

      <Select
        label="End condition"
        options={endOptions}
        value={options.endType}
        onChange={(e) => updateOptions({ endType: e.target.value })}
      />

      {options.endType === 'count' && (
        <Input
          label="After"
          type="number"
          min="1"
          value={options.count}
          onChange={(e) => updateOptions({ count: parseInt(e.target.value) || 1 })}
        />
      )}

      {options.endType === 'until' && (
        <DatePicker
          label="Until"
          value={options.until}
          onChange={(e) => updateOptions({ until: e.target.value })}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Preview
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400">{preview}</p>
      </div>
    </div>
  )
}

export default RRuleBuilder
