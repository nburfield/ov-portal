import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'
import Tabs from '../ui/Tabs'

const AreaChartComponent = ({ data, title }) => {
  const [activePeriod, setActivePeriod] = useState('12m')

  const tabs = [
    { key: '12m', label: '12 Months' },
    { key: '6m', label: '6 Months' },
    { key: '30d', label: '30 Days' },
  ]

  const getFilteredData = () => {
    switch (activePeriod) {
      case '6m':
        return data.slice(-6)
      case '30d':
        return data.slice(-1)
      default:
        return data
    }
  }

  const filteredData = getFilteredData()

  return (
    <Card title={title} className="w-full">
      <div className="mb-4">
        <Tabs tabs={tabs} activeTab={activePeriod} onChange={setActivePeriod} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
          <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default AreaChartComponent
