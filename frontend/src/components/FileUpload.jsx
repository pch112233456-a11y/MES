import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react'

function FileUpload({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('CSV 형식의 파일만 업로드할 수 있습니다.')
      setFile(null)
      return
    }
    setError('')
    setFile(selectedFile)
    await uploadFile(selectedFile)
  }

  const uploadFile = async (targetFile) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', targetFile)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || '파일 분석 중 오류가 발생했습니다.')
      }

      const result = await response.json()
      onUploadSuccess(result)
    } catch (err) {
      setError(err.message)
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const downloadSampleCSV = () => {
    const csvContent = 
      "process_name,quantity,wait_time,wip_count,machine_utilization\n" +
      "자재투입(Material Intake),1200,8.5,3.2,45.5\n" +
      "1차 정밀가공(Machining A),1150,12.0,4.5,65.0\n" +
      "열처리공정(Heat Treatment),420,55.0,28.0,94.5\n" +
      "2차 정밀가공(Machining B),950,18.0,9.5,82.0\n" +
      "최종 도장(Painting),1050,42.0,18.5,88.0\n" +
      "품질검사(QC Inspection),980,10.0,4.0,55.0\n" +
      "완제품포장(Packaging),950,6.0,2.1,38.0\n";
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "mes_production_sample.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`w-full max-w-2xl min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 glass-panel ${
          dragActive 
            ? 'border-cyan-400 bg-cyan-50/20 scale-[1.01] shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)]' 
            : 'border-slate-300 hover:border-slate-450 hover:bg-slate-100/30'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
            </div>
            <p className="text-slate-500 text-sm font-medium animate-pulse">MES 가동 데이터를 분석하고 있습니다...</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-center text-cyan-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-slate-700 font-medium text-sm max-w-[300px] truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex items-center text-emerald-600 gap-1 text-xs">
              <CheckCircle size={14} />
              <span>분석 완료</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 transition-colors group-hover:text-slate-600">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-slate-600 font-semibold text-base">MES 가동 데이터 업로드</p>
              <p className="text-xs text-slate-400 mt-1">드래그 앤 드롭 하거나 클릭하여 CSV 파일 선택</p>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/50">
              필수 열: process_name, quantity, wait_time, wip_count, machine_utilization
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 w-full max-w-2xl glass-panel border-red-200 bg-red-50 rounded-xl p-4 flex items-start gap-3 text-red-600 text-sm animate-fade-in-up">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">업로드 실패</p>
            <p className="text-xs text-red-500/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!file && !loading && (
        <div className="mt-5 text-center">
          <span className="text-xs text-slate-400">테스트용 데이터가 없으신가요? </span>
          <button 
            onClick={downloadSampleCSV}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline transition"
          >
            샘플 CSV 파일 다운로드
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUpload
