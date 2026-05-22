import React, { useState } from 'react'
import FileUpload from './FileUpload.jsx'
import SummaryCards from './SummaryCards.jsx'
import ProcessFlow from './ProcessFlow.jsx'
import BottleneckTable from './BottleneckTable.jsx'
import ProcessCharts from './ProcessCharts.jsx'
import RecommendationPanel from './RecommendationPanel.jsx'
import { Sparkles, RefreshCw, BarChart3, Database } from 'lucide-react'

function Dashboard() {
  const [data, setData] = useState(null)
  const [selectedProcess, setSelectedProcess] = useState(null)
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null)

  const handleUploadSuccess = (result) => {
    setData(result)
    
    // YYYY-MM-DD HH:mm:ss 포맷의 현재 시각 생성
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    setLastUpdatedTime(formatted)

    // Auto-select the first bottleneck or warning process if available, otherwise first process
    if (result.processes && result.processes.length > 0) {
      const sorted = [...result.processes].sort((a, b) => b.score - a.score)
      setSelectedProcess(sorted[0])
    }
  }

  const handleReset = () => {
    setData(null)
    setSelectedProcess(null)
    setLastUpdatedTime(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_-2px_rgba(6,182,212,0.3)]">
              ⚡
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 font-sans bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
              MES 생산 병목 예측 & 공정 최적화 플랫폼
            </h1>
            
            {/* 실시간 LIVE 상태 추가 */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[11px] font-bold shadow-[0_0_8px_-1px_rgba(16,185,129,0.15)] ml-1 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE 실시간 분석중
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            <p className="text-xs text-slate-500 font-medium">
              AI 기반 데이터 분석을 통해 병목 구간을 탐지하고 공정 효율 극대화를 위한 맞춤 처방을 실시간으로 도출합니다.
            </p>
            {lastUpdatedTime && (
              <span className="hidden sm:inline text-slate-300 text-[11px]">|</span>
            )}
            {lastUpdatedTime && (
              <span className="text-[11px] text-slate-550 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 flex items-center gap-1">
                마지막 업데이트: <span className="font-mono text-slate-600 font-normal">{lastUpdatedTime}</span>
              </span>
            )}
          </div>
        </div>

        {data && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition duration-150 shadow-sm"
          >
            <RefreshCw size={14} />
            새 데이터 업로드
          </button>
        )}
      </header>

      {/* Main Content Area */}
      {!data ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200/60 mb-2">
              <Sparkles size={12} />
              1-Week Beta MVP
            </div>
            <h2 className="text-xl font-bold text-slate-700">생산 라인 로그 파일을 즉시 업로드하세요</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              MES 시스템의 설비별 가동 실적, 대기 시간 및 WIP 로그 정보가 담긴 CSV 파일을 분석하여 공정 최적화 솔루션을 받아볼 수 있습니다.
            </p>
          </div>

          <FileUpload onUploadSuccess={handleUploadSuccess} />

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-6">
            <div className="glass-panel p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-500">
                <Database size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">정밀 룰 엔진 진단</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">대기시간, WIP 적체 수량, 설비 가동 효율을 다각적으로 산출하여 생산 흐름을 저해하는 요소를 명확히 집어냅니다.</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                <BarChart3 size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">실시간 데이터 시각화</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Recharts 기반 차트를 통해 공정별 처리량 추세 및 가동률 대 대기시간 분포의 상관관계를 시각화하여 보고해 드립니다.</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                <Sparkles size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">맞춤형 공정 처방</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">라인 밸런싱 재배치, 예방정비 PM 강화, 외주 가공 등 각 공정 병목 지표에 최적화된 처방 시나리오를 안내합니다.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Summary Cards */}
          <SummaryCards summary={data.summary} />

          {/* 1.5. Process Flow Visualization */}
          <ProcessFlow 
            processes={data.processes} 
            selectedProcess={selectedProcess}
            onSelectProcess={setSelectedProcess}
          />

          {/* 2. Visualizations */}
          <ProcessCharts processes={data.processes} />

          {/* 3. Breakdown Table */}
          <div className="w-full">
            <BottleneckTable 
              processes={data.processes} 
              selectedProcess={selectedProcess}
              onSelectProcess={setSelectedProcess}
            />
          </div>

          {/* 4. Recommendation Panel */}
          <div className="w-full animate-fade-in-up">
            <RecommendationPanel selectedProcess={selectedProcess} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
