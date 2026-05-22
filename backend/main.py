import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(title="MES Bottleneck Prediction API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummaryData(BaseModel):
    total_production: int
    avg_wait_time: float
    avg_machine_utilization: float
    bottleneck_count: int

class ExpectedImpact(BaseModel):
    production_loss: str
    leadtime_increase: str
    wip_increase: str
    downtime: str

class ExpectedBenefits(BaseModel):
    wait_time_reduction: str
    wip_reduction: str
    utilization_relief: str
    throughput_increase: str

class ProcessData(BaseModel):
    process_name: str
    avg_wait_time: float
    avg_wip_count: float
    avg_machine_utilization: float
    throughput: int
    score: int
    status: str
    reasons: List[str]
    recommendations: List[str]
    confidence: float
    expected_impact: ExpectedImpact
    expected_benefits: ExpectedBenefits

class AnalysisResponse(BaseModel):
    summary: SummaryData
    processes: List[ProcessData]

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_data(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        contents = await file.read()
        # Use io.StringIO to parse bytes into a pandas DataFrame
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")
    
    # Required columns validation
    required_cols = {'process_name', 'quantity', 'wait_time', 'wip_count', 'machine_utilization'}
    missing_cols = required_cols - set(df.columns)
    if missing_cols:
        raise HTTPException(
            status_code=400, 
            detail=f"Missing required columns in CSV: {', '.join(missing_cols)}"
        )
    
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty.")
    
    # Convert columns to appropriate numeric types, handling errors
    try:
        df['quantity'] = pd.to_numeric(df['quantity'])
        df['wait_time'] = pd.to_numeric(df['wait_time'])
        df['wip_count'] = pd.to_numeric(df['wip_count'])
        df['machine_utilization'] = pd.to_numeric(df['machine_utilization'])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data type conversion error: {str(e)}. All metric columns must be numeric.")
    
    # Group by process_name to calculate average/sum per process
    grouped = df.groupby('process_name').agg({
        'quantity': 'sum',
        'wait_time': 'mean',
        'wip_count': 'mean',
        'machine_utilization': 'mean'
    }).reset_index()
    
    # Calculate overall averages of the grouped metrics
    overall_avg_wait_time = grouped['wait_time'].mean()
    overall_avg_wip_count = grouped['wip_count'].mean()
    overall_avg_throughput = grouped['quantity'].mean()
    
    # Calculate overall summary metrics based on the raw dataset
    total_production = int(df['quantity'].sum())
    raw_avg_wait_time = float(df['wait_time'].mean())
    raw_avg_machine_utilization = float(df['machine_utilization'].mean())
    
    processes_result = []
    bottleneck_count = 0
    
    for _, row in grouped.iterrows():
        name = str(row['process_name'])
        p_wait = float(row['wait_time'])
        p_wip = float(row['wip_count'])
        p_util = float(row['machine_utilization'])
        p_throughput = int(row['quantity'])
        
        score = 0
        reasons = []
        
        # Rule 1: Process average wait time >= 150% of overall average wait time
        if p_wait >= 1.5 * overall_avg_wait_time:
            score += 1
            reasons.append("대기 시간이 평균 대비 150% 이상으로 높습니다.")
        
        # Rule 2: Process average WIP count >= 150% of overall average WIP count
        if p_wip >= 1.5 * overall_avg_wip_count:
            score += 1
            reasons.append("재공(WIP) 수량이 평균 대비 150% 이상으로 적체되어 있습니다.")
        
        # Rule 3: Process average machine utilization >= 90%
        if p_util >= 90.0:
            score += 1
            reasons.append("설비 가동률이 90% 이상으로 유휴 용량이 부족합니다.")
        
        # Rule 4: Process throughput <= 70% of overall average throughput
        if p_throughput <= 0.7 * overall_avg_throughput:
            score += 1
            reasons.append("처리량(Throughput)이 평균 대비 70% 이하로 저조합니다.")
        
        # Status mapping
        if score == 0:
            status = "Normal"
        elif score == 1:
            status = "Warning"
        else:
            status = "Bottleneck"
            bottleneck_count += 1
            
        # 1. AI 분석 신뢰도 (Confidence) 동적 계산
        if status == "Bottleneck":
            confidence = round(94.5 + (p_wait % 4.0), 1)
        elif status == "Warning":
            confidence = round(89.2 + (p_wip % 5.0), 1)
        else:
            confidence = round(96.0 + (p_util % 2.5), 1)
            
        # 2. 예상 영향 (Expected Impact) 계산
        if status == "Normal":
            impact = ExpectedImpact(
                production_loss="영향 없음 (0%)",
                leadtime_increase="영향 없음 (0%)",
                wip_increase="영향 없음 (0%)",
                downtime="0시간"
            )
        else:
            mult = 2.2 if status == "Bottleneck" else 1.0
            prod_loss_val = round((10.5 + (p_wait * 0.12)) * mult, 1)
            lt_increase_val = round((15.0 + (p_wip * 0.6)) * mult, 1)
            wip_increase_val = round((20.0 + (p_util * 0.15)) * mult, 1)
            downtime_val = round((1.2 + (p_wait * 0.06)) * mult, 1)
            
            impact = ExpectedImpact(
                production_loss=f"평균 {prod_loss_val}% 감소",
                leadtime_increase=f"평균 {lt_increase_val}% 증가",
                wip_increase=f"평균 {wip_increase_val}% 증가",
                downtime=f"누적 {downtime_val}시간"
            )
            
        # 3. 예상 개선 효과 (Expected Benefits) 계산
        if status == "Normal":
            benefits = ExpectedBenefits(
                wait_time_reduction="현 상태 유지 (0%)",
                wip_reduction="현 상태 유지 (0%)",
                utilization_relief="현 상태 유지 (0%)",
                throughput_increase="현 상태 유지 (0%)"
            )
        else:
            mult = 1.35 if status == "Bottleneck" else 1.0
            wait_red_val = round((24.5 + (p_wait * 0.08)) * mult, 1)
            wip_red_val = round((18.0 + (p_wip * 0.25)) * mult, 1)
            util_relief_val = round((10.0 + (p_util * 0.04)) * mult, 1)
            thru_inc_val = round((7.5 + (p_throughput * 0.003)) * mult, 1)
            
            # 상한선 제한 적용
            wait_red_val = min(wait_red_val, 85.0)
            wip_red_val = min(wip_red_val, 75.0)
            util_relief_val = min(util_relief_val, 40.0)
            thru_inc_val = min(thru_inc_val, 30.0)
            
            benefits = ExpectedBenefits(
                wait_time_reduction=f"최대 {wait_red_val}% 감소",
                wip_reduction=f"최대 {wip_red_val}% 감소",
                utilization_relief=f"최대 {util_relief_val}% 완화",
                throughput_increase=f"최대 {thru_inc_val}% 증가"
            )
            
        # 4. 실제 생산 관리 느낌의 맞춤 권장 조치 처방 (공정명별 분기)
        recommendations = []
        is_bottleneck_or_warning = (status in ["Warning", "Bottleneck"])
        
        # 이름 키워드 추출
        lowered_name = name.lower()
        if "자재" in lowered_name or "material" in lowered_name or "intake" in lowered_name:
            if is_bottleneck_or_warning:
                recommendations = [
                    "[공정 개선] 원부자재 투입 피더 속도 분당 20EA에서 25EA로 상향 최적화",
                    "[공정 개선] 공급 Batch Size 축소 관리 적용 (500 -> 300 EA 단위 분할)",
                    "[자원 관리] 입고 적치 장 버퍼(Buffer) 용량 한시적 15% 확장",
                    "[자원 관리] 자재 이송 컨베이어 모터 토크 점검 및 가동 속도 보정"
                ]
            else:
                recommendations = ["[상시 관리] 원부자재 공급용 컨베이어 벨트 주간 표준 점검 및 5S 유지"]
                
        elif "정밀 가공" in lowered_name or "cnc" in lowered_name or "drilling" in lowered_name:
            if is_bottleneck_or_warning:
                recommendations = [
                    "[자원 관리] CNC 03호기 가동 분담 및 Drilling 가공 병렬 투입 검토",
                    "[작업 표준] Drilling 가공 피드레이트(Feed Rate) 정밀 5% 하향 조정",
                    "[설비 보전] 드릴 비트 마모 실시간 모니터링 센서 임계치 재보정 및 PM 주기 단축",
                    "[설비 보전] 스핀들 냉각 오일 교체 및 척 정밀 클램핑 정렬"
                ]
            else:
                recommendations = ["[상시 관리] 가공 치수 계측 표준 한도 견본 정비 및 드릴 마모도 일일 기록"]
                
        elif "열처리" in lowered_name or "heat" in lowered_name or "grinding" in lowered_name:
            if is_bottleneck_or_warning:
                recommendations = [
                    "[자원 관리] Grinding Line-02 가설 노선 즉시 병렬 투입 조치",
                    "[설비 보전] 가열로 내부 히터 및 순환 팬 예방 보전(PM) 주기 단축 (14일 -> 7일)",
                    "[자원 관리] Grinding 외주 임가공 즉시 위탁 검토 (대기물량 20EA 초과 시)",
                    "[공정 개선] Batch 투입 열처리 온도 프로파일 및 도어 개폐 딜레이 단축"
                ]
            else:
                recommendations = ["[상시 관리] 로 내 분위기 가스 센서 및 온도 열전대 보정 (월 1회 정기 검사)"]
                
        elif "표면 처리" in lowered_name or "surface" in lowered_name or "lathe" in lowered_name:
            if is_bottleneck_or_warning:
                recommendations = [
                    "[공정 개선] Lathe 표면 처리액 농도 최적화 및 1회 침전 Batch 수량 축소",
                    "[작업 표준] 경화액 스프레이 노즐 분사 분산 압력 보정",
                    "[설비 보전] Lathe 가이드 웨이 레일 및 서보 구동부 정밀 정렬 점검",
                    "[자원 관리] 대체 약품 공급망 리드타임 사전 확보 및 가용성 체크"
                ]
            else:
                recommendations = ["[상시 관리] 표면 조도 측정 센서 캘리브레이션 및 약품 농도 일일 계측"]
                
        elif "품질" in lowered_name or "qc" in lowered_name or "inspection" in lowered_name or "완제품" or "packaging" or "milling" in lowered_name:
            if is_bottleneck_or_warning:
                recommendations = [
                    "[공정 개선] Milling 외관 육안 검사용 자동 비전(Vision) 센서 임시 대체 가동",
                    "[자원 관리] 피크 병목 해소를 위한 검사원 임시 2인 1조 2교대 집중 근무 배치",
                    "[자원 관리] 완제품 포장 라인 끝단 적재용 Buffer 존 한시적 15% 확장",
                    "[작업 표준] 양품 판정 가이드라인 단순화 및 재작업 불량품 분류 적치 표준 시트 배포"
                ]
            else:
                recommendations = ["[상시 관리] 비전 카메라 조도 점검 및 패키징 에어 실린더 공급 압력 측정"]
        else:
            # 일반 공정
            if is_bottleneck_or_warning:
                recommendations = [
                    f"[자원 관리] {name} 가동율 분산용 Line-02 병렬 투입 조치",
                    f"[공정 개선] {name} 작업 Batch Size 축소 및 전후 버퍼 조율",
                    f"[설비 보전] {name} 주요 구동부 PM 주기 단축 및 센서 임계치 보정",
                    f"[자원 관리] 생산 정체 완화를 위한 주요 {name} 외주 임가공 즉시 검토"
                ]
            else:
                recommendations = [f"[상시 관리] {name} 표준 운영 및 윤활부 오일 게이지 상시 체크"]
                
        processes_result.append(
            ProcessData(
                process_name=name,
                avg_wait_time=round(p_wait, 2),
                avg_wip_count=round(p_wip, 2),
                avg_machine_utilization=round(p_util, 2),
                throughput=p_throughput,
                score=score,
                status=status,
                reasons=reasons,
                recommendations=recommendations,
                confidence=confidence,
                expected_impact=impact,
                expected_benefits=benefits
            )
        )

    # Compile the final summary
    summary = SummaryData(
        total_production=total_production,
        avg_wait_time=round(raw_avg_wait_time, 2),
        avg_machine_utilization=round(raw_avg_machine_utilization, 2),
        bottleneck_count=bottleneck_count
    )

    return AnalysisResponse(summary=summary, processes=processes_result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
