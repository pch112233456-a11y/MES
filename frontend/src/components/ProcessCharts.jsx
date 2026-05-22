import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 bg-white/95">
        <p className="font-bold text-slate-800">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-5">
            <span style={{ color: item.color }} className="font-medium">{item.name}:</span>
            <span className="font-mono font-bold text-slate-700">
              {item.value.toLocaleString()}{item.unit || ''}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function ProcessCharts({ processes }) {
  // Sort processes by throughput to see flow progression or magnitude
  const chartData = processes.map(p => ({
    name: p.process_name,
    throughput: p.throughput,
    wait_time: p.avg_wait_time,
    wip: p.avg_wip_count,
    utilization: p.avg_machine_utilization
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Throughput Chart */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col h-[380px] shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-700">공정별 처리량 (Throughput)</h4>
          <p className="text-[11px] text-slate-400">완료 수량 기준 공정 처리 성능 비교</p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.split('(')[0] || val}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                name="처리량" 
                dataKey="throughput" 
                fill="url(#colorThroughput)" 
                radius={[4, 4, 0, 0]}
                unit=" EA"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Correlation Chart: Machine Utilization & Wait Time */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col h-[380px] shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-700">가동률 & 대기시간 상관관계</h4>
          <p className="text-[11px] text-slate-400">설비 가동 부하와 공정 지연 간 유기성 분석</p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: -20, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.split('(')[0] || val}
              />
              <YAxis 
                yAxisId="left"
                stroke="#94A3B8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#94A3B8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit="m"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar 
                yAxisId="left"
                name="설비 가동률" 
                dataKey="utilization" 
                fill="#8B5CF6" 
                fillOpacity={0.4}
                radius={[4, 4, 0, 0]}
                unit="%"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                name="대기 시간" 
                dataKey="wait_time" 
                stroke="#3B82F6" 
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 1 }}
                unit=" 분"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default ProcessCharts
