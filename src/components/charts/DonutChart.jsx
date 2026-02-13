import React from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'

const DonutChart = ({ data, title, centerLabel }) => {
  const renderLegend = (props) => {
    const { payload } = props
    return (
      <ul className="flex justify-center space-x-4 mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-sm text-text-primary">{entry.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card title={title} className="w-full">
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{centerLabel}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DonutChart
