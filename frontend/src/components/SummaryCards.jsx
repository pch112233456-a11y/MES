import React from 'react'
import { Activity, Clock, Cpu, AlertOctagon } from 'lucide-react'

function SummaryCards({ summary }) {
  const cards = [
    {
      title: '총 생산량',
      value: summary.total_production.toLocaleString() + ' EA',
      desc: '전체 공정 총 처리 수량',
      icon: Activity,
      color: 'cyan',
      glow: 'shadow-[0_4px_20px_-4px_rgba(6,182,212,0.12)]',
      iconClass: 'text-cyan-600 bg-cyan-50 border-cyan-200/50'
    },
    {
      title: '평균 대기 시간',
      value: summary.avg_wait_time.toFixed(1) + ' 분',
      desc: '공정간 평균 대기 지연',
      icon: Clock,
      color: 'indigo',
      glow: 'shadow-[0_4px_20px_-4px_rgba(99,102,241,0.12)]',
      iconClass: 'text-indigo-600 bg-indigo-50 border-indigo-200/50'
    },
    {
      title: '평균 설비 가동률',
      value: summary.avg_machine_utilization.toFixed(1) + '%',
      desc: '설비 가동 효율 요약',
      icon: Cpu,
      color: 'purple',
      glow: 'shadow-[0_4px_20px_-4px_rgba(139,92,246,0.12)]',
      iconClass: 'text-purple-600 bg-purple-50 border-purple-200/50'
    },
    {
      title: '병목 의심 공정',
      value: summary.bottleneck_count + ' 개',
      desc: '즉각 조치 조율 권장',
      icon: AlertOctagon,
      color: summary.bottleneck_count > 0 ? 'red' : 'emerald',
      glow: summary.bottleneck_count > 0 
        ? 'shadow-[0_4px_20px_-4px_rgba(239,68,68,0.12)]' 
        : 'shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)]',
      iconClass: summary.bottleneck_count > 0 
        ? 'text-red-600 bg-red-50 border-red-200/50' 
        : 'text-emerald-600 bg-emerald-50 border-emerald-200/50'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div 
            key={idx} 
            className={`glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${card.glow}`}
          >
            {/* Subtle card grid effect */}
            <div className="absolute inset-0 bg-glass-grad pointer-events-none"></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-medium tracking-wide uppercase">{card.title}</span>
                <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{card.value}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconClass}`}>
                <Icon size={20} />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 relative z-10">
              <span className="text-[11px] text-slate-400">{card.desc}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SummaryCards
