import React from 'react'
import { 
  Sparkles, ArrowRight, CheckSquare, ShieldCheck, AlertTriangle,
  TrendingDown, Clock, Layers, Activity, Zap, Minimize2, Cpu, TrendingUp
} from 'lucide-react'

function RecommendationPanel({ selectedProcess }) {
  if (!selectedProcess) {
    return (
      <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[220px] shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-4 animate-pulse-subtle">
          <Sparkles size={22} />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">AI 공정 최적화 조치 가이드</h4>
        <p className="text-xs text-slate-450 max-w-sm mt-1">
          상단 종합 분석 테이블에서 개별 공정 행을 클릭하시면, 해당 공정의 진단 근거 및 맞춤형 최적화 권장안을 실시간으로 도출해 드립니다.
        </p>
      </div>
    )
  }

  const { 
    process_name, 
    status, 
    reasons, 
    recommendations, 
    score,
    confidence = 95.0, 
    expected_impact, 
    expected_benefits 
  } = selectedProcess

  return (
    <div className="glass-panel p-6 rounded-2xl w-full h-full flex flex-col justify-between border-l-4 border-l-cyan-500 animate-fade-in-up shadow-sm">
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-cyan-600 animate-pulse" />
            <h4 className="text-base font-extrabold text-slate-800 tracking-tight">{process_name} 최적화 가이드</h4>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
            status === 'Bottleneck' 
              ? 'bg-red-50 text-red-600 border border-red-200/50 animate-pulse' 
              : status === 'Warning' 
              ? 'bg-amber-50 text-amber-600 border border-amber-200/50' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
          }`}>
            {status === 'Bottleneck' ? '병목 단계' : status === 'Warning' ? '주의 단계' : '정상 작동'}
          </span>
        </div>

        {/* AI 분석 신뢰도 (Confidence) 추가 */}
        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl shadow-inner">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-slate-650">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              AI 분석 신뢰도
            </span>
            <span className="font-mono text-cyan-650 text-xs font-extrabold">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Reasons (if warning or bottleneck) */}
        {reasons && reasons.length > 0 ? (
          <div className="space-y-2">
            <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">진단 근거 ({reasons.length})</h5>
            <div className="space-y-1.5">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50/60 border border-amber-100 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                  <span className="font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-xs text-emerald-700 bg-emerald-50/60 border border-emerald-100 px-3.5 py-3 rounded-xl">
            <ShieldCheck size={18} className="shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <p className="font-bold text-emerald-800">완벽한 자원 밸런스</p>
              <p className="text-emerald-600/90 mt-0.5 leading-relaxed">현재 공정은 처리량, 대기 시간, 설비 가동율 면에서 균형 잡힌 가동 상태를 유지하고 있습니다.</p>
            </div>
          </div>
        )}

        {/* Expected Impact (예상 영향) */}
        {expected_impact && (
          <div className="space-y-2">
            <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">시스템 예상 파급 영향 (Worst Case)</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-red-50/20 border border-red-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-red-200">
                <TrendingDown size={14} className="text-red-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">생산량 감소</p>
                  <p className="text-xs font-bold text-slate-700 mt-1 truncate">{expected_impact.production_loss}</p>
                </div>
              </div>
              <div className="bg-red-50/20 border border-red-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-red-200">
                <Clock size={14} className="text-red-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">리드타임 증가</p>
                  <p className="text-xs font-bold text-slate-700 mt-1 truncate">{expected_impact.leadtime_increase}</p>
                </div>
              </div>
              <div className="bg-red-50/20 border border-red-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-red-200">
                <Layers size={14} className="text-red-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">재공(WIP) 적체</p>
                  <p className="text-xs font-bold text-slate-700 mt-1 truncate">{expected_impact.wip_increase}</p>
                </div>
              </div>
              <div className="bg-red-50/20 border border-red-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-red-200">
                <Activity size={14} className="text-red-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">차질 예상 시간</p>
                  <p className="text-xs font-bold text-slate-700 mt-1 truncate">{expected_impact.downtime}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expected Benefits (예상 개선 효과) */}
        {expected_benefits && (
          <div className="space-y-2">
            <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">조치 시 기대 개선 효과 (Expected Benefits)</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-emerald-50/15 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-emerald-200">
                <Zap size={14} className="text-emerald-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">대기시간 감소</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 truncate">{expected_benefits.wait_time_reduction}</p>
                </div>
              </div>
              <div className="bg-emerald-50/15 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-emerald-200">
                <Minimize2 size={14} className="text-emerald-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">재공(WIP) 감축</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 truncate">{expected_benefits.wip_reduction}</p>
                </div>
              </div>
              <div className="bg-emerald-50/15 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-emerald-200">
                <Cpu size={14} className="text-emerald-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">설비 부하 완화</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 truncate">{expected_benefits.utilization_relief}</p>
                </div>
              </div>
              <div className="bg-emerald-50/15 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2.5 transition hover:border-emerald-200">
                <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[9px] font-semibold text-slate-400 leading-none">처리량 상향</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 truncate">{expected_benefits.throughput_increase}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2.5">
          <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">현장 맞춤형 최적화 권장 조치</h5>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-xl transition hover:border-slate-200 hover:bg-slate-100/40">
                  <CheckSquare size={15} className="text-cyan-600 mt-0.5 shrink-0 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{rec}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <CheckSquare size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">특별한 조정 조치가 요구되지 않습니다. 일일 표준 예방 정비 프로토콜에 따라 상시 관리를 진행해 주십시오.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 font-mono">병목 유발 지수: {score}/4</span>
        <button 
          onClick={() => window.print()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50"
        >
          보고서 인쇄
          <ArrowRight size={12} className="text-slate-400" />
        </button>
      </div>
    </div>
  )
}

export default RecommendationPanel
