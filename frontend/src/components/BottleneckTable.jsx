import React from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

function BottleneckTable({ processes, selectedProcess, onSelectProcess }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
            <CheckCircle2 size={12} />
            정상
          </span>
        )
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/50">
            <AlertTriangle size={12} />
            주의
          </span>
        )
      case 'Bottleneck':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200/50 animate-pulse">
            <AlertCircle size={12} />
            병목
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden w-full shadow-sm">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">공정별 종합 분석 정보</h3>
          <p className="text-xs text-slate-500 mt-0.5">각 공정의 실시간 가동 데이터를 기반으로 분석된 상세 지표입니다.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-50">
              <th className="py-4 px-6">공정명</th>
              <th className="py-4 px-6 text-right">처리량 (Throughput)</th>
              <th className="py-4 px-6 text-right">대기 시간 (Wait Time)</th>
              <th className="py-4 px-6 text-right">재공 수량 (WIP)</th>
              <th className="py-4 px-6 text-right">설비 가동률</th>
              <th className="py-4 px-6 text-center">병목 지수</th>
              <th className="py-4 px-6 text-center">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {processes.map((p, index) => {
              const isSelected = selectedProcess && selectedProcess.process_name === p.process_name
              return (
                <tr 
                  key={index} 
                  onClick={() => onSelectProcess(p)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected 
                      ? 'bg-cyan-50/50 border-l-4 border-l-cyan-500' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-slate-700">
                    {p.process_name}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-slate-600">
                    {p.throughput.toLocaleString()} EA
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-slate-600">
                    {p.avg_wait_time.toFixed(1)} 분
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-slate-600">
                    {p.avg_wip_count.toFixed(1)} EA
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-slate-600">
                    {p.avg_machine_utilization.toFixed(1)}%
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block w-6 h-6 rounded-full text-xs line-height-6 font-semibold ${
                      p.score >= 2 
                        ? 'bg-red-50 text-red-600 border border-red-250/50' 
                        : p.score === 1 
                        ? 'bg-amber-50 text-amber-600 border border-amber-250/50' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                    } flex items-center justify-center mx-auto`}>
                      {p.score}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(p.status)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-200/60 text-right">
        <span className="text-xs text-slate-400">테이블 행을 클릭하면 하단에 추천 최적화 조치가 표시됩니다.</span>
      </div>
    </div>
  )
}

export default BottleneckTable
