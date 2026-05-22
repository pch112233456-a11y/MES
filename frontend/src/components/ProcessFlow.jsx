import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

// 고정된 5대 표준 공정 파이프라인 정보 및 데이터 매핑 키워드 정의
const PIPELINE_STEPS = [
  { key: 'Additive', label: 'Additive (적층/자재)', matchKeywords: ['자재', 'material', 'intake', 'additive'] },
  { key: 'Drilling', label: 'Drilling (천공/가공)', matchKeywords: ['1차', 'cnc', 'drilling', 'machining'] },
  { key: 'Grinding', label: 'Grinding (연삭/열처리)', matchKeywords: ['열처리', 'heat', 'grinding', 'treatment'] },
  { key: 'Lathe', label: 'Lathe (선삭/표면)', matchKeywords: ['2차', 'surface', 'lathe', 'treatment'] },
  { key: 'Milling', label: 'Milling (밀링/검사포장)', matchKeywords: ['품질', '포장', 'qc', 'packaging', 'milling', 'inspection'] }
]

function ProcessFlow({ processes, selectedProcess, onSelectProcess }) {
  // 백엔드 프로세스 배열에서 매핑되는 실제 데이터 검색
  const getMappedProcess = (step) => {
    if (!processes) return null
    return processes.find(p => {
      const loweredName = p.process_name.toLowerCase()
      return step.matchKeywords.some(keyword => loweredName.includes(keyword))
    })
  }

  // 상태 배지 및 애니메이션 CSS 획득
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Bottleneck':
        return {
          cardClass: 'animate-pulse-glow-red border-red-500 bg-red-50/50 hover:bg-red-100/50 text-red-900',
          badge: <span className="flex items-center gap-1 text-[10px] font-bold text-red-650 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">병목</span>,
          lineColor: '#ef4444' // 빨간색
        }
      case 'Warning':
        return {
          cardClass: 'animate-pulse-glow-amber border-amber-500 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900',
          badge: <span className="flex items-center gap-1 text-[10px] font-bold text-amber-650 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">주의</span>,
          lineColor: '#f59e0b' // 주황색
        }
      case 'Normal':
      default:
        return {
          cardClass: 'animate-pulse-glow-emerald border-emerald-500 bg-emerald-50/40 hover:bg-emerald-100/40 text-emerald-900',
          badge: <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">정상</span>,
          lineColor: '#10b981' // 초록색
        }
    }
  }

  return (
    <div className="glass-panel p-6 rounded-2xl w-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-ping"></span>
            실시간 공정 흐름 및 흐름선 모니터링 (Process Flow & Line Activity)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            5대 표준 공정 라인의 재공품(WIP) 흐름 활성도와 병목 구간의 Red Glow 상태를 실시간 시각화합니다.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>정상</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>주의</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>병목 (Red Glow)</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-2 lg:gap-0 overflow-x-auto py-4 px-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const matchedProc = getMappedProcess(step)
          const name = matchedProc ? matchedProc.process_name : step.label
          const status = matchedProc ? matchedProc.status : 'Normal'
          const throughput = matchedProc ? matchedProc.throughput : 0
          const wip = matchedProc ? matchedProc.avg_wip_count : 0
          const style = getStatusStyle(status)
          
          const isSelected = selectedProcess && matchedProc && selectedProcess.process_name === matchedProc.process_name
          const isLast = idx === PIPELINE_STEPS.length - 1

          return (
            <React.Fragment key={step.key}>
              {/* 공정 노드 카드 */}
              <div 
                onClick={() => matchedProc && onSelectProcess(matchedProc)}
                className={`flex-1 min-w-[200px] border rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between ${style.cardClass} ${
                  isSelected ? 'ring-2 ring-cyan-500 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">STEP 0{idx + 1}</span>
                    {style.badge}
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 tracking-tight leading-tight">{step.label}</h4>
                  {matchedProc && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{matchedProc.process_name}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="text-[9px] font-medium text-slate-400 block uppercase">처리량</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">{throughput.toLocaleString()} EA</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-medium text-slate-400 block uppercase">재공(WIP)</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">{wip.toFixed(1)} EA</span>
                  </div>
                </div>
              </div>

              {/* 연결 흐름선 (마지막 노드가 아닐 경우 렌더링) */}
              {!isLast && (
                <div className="flex items-center justify-center min-w-[30px] lg:w-[60px] h-[50px] lg:h-auto py-2 lg:py-0">
                  {/* SVG 흐름선 애니메이션 */}
                  <svg className="w-8 h-8 lg:w-full lg:h-6 overflow-visible" preserveAspectRatio="none">
                    {/* 데스크탑 모드: 가로선 / 모바일 모드: 세로선 대응 */}
                    <g className="hidden lg:block">
                      <line 
                        x1="-5" 
                        y1="12" 
                        x2="100%" 
                        y2="12" 
                        stroke={style.lineColor} 
                        strokeWidth="2.5" 
                        strokeDasharray="6, 6" 
                        className="animate-flow-dash" 
                      />
                      <polygon points="45,8 53,12 45,16" fill={style.lineColor} className="animate-pulse" />
                    </g>
                    <g className="block lg:hidden">
                      <line 
                        x1="16" 
                        y1="-5" 
                        x2="16" 
                        y2="100%" 
                        stroke={style.lineColor} 
                        strokeWidth="2.5" 
                        strokeDasharray="6, 6" 
                        className="animate-flow-dash" 
                      />
                      <polygon points="12,15 16,23 20,15" fill={style.lineColor} className="animate-pulse" />
                    </g>
                  </svg>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="mt-3 text-right">
        <span className="text-[10px] text-slate-400">공정 카드를 클릭하면 하단 패널에 맞춤형 상세 최적화 처방이 연동됩니다.</span>
      </div>
    </div>
  )
}

export default ProcessFlow
