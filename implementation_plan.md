# MES Bottleneck Prediction MVP Implementation Plan

This document outlines the plan to build a 1-week beta (MVP) of the AI-based MES production bottleneck prediction and process optimization platform.

## Proposed Architecture & Changes

The project will be structured into two main directories: `backend` and `frontend`. 

### Project Structure
```text
mes-bottleneck-mvp/
├── backend/
│   ├── main.py
│   ├── requirements.txt
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── BottleneckTable.jsx
│   │   │   ├── ProcessCharts.jsx
│   │   │   └── RecommendationPanel.jsx
├── sample_data/
│   └── production_sample.csv
└── README.md
```

### Backend (FastAPI + Pandas)
- **`main.py`**:
  - Expose `POST /api/analyze` endpoint.
  - Read uploaded CSV using `pandas`.
  - Validate required columns.
  - Calculate metrics:
    - `throughput`: Sum of `quantity` for each process.
    - `machine_utilization`: Expected to be 0-100 percentage.
  - Overall Summary logic:
    - `total_production` = Sum of all `quantity`
    - `avg_wait_time` = Overall mean of `wait_time`
    - `bottleneck_count` = Number of processes with status "Bottleneck"
    - `avg_machine_utilization` = Overall mean of `machine_utilization`
  - Compute `Bottleneck Score`:
    - Process average wait time >= 150% of overall average wait time -> +1
    - Process average WIP count >= 150% of overall average WIP count -> +1
    - Process average machine utilization >= 90% -> +1
    - Process throughput <= 70% of overall average throughput -> +1
  - Status Mapping:
    - Score 0: Normal / 정상
    - Score 1: Warning / 주의
    - Score >= 2: Bottleneck / 병목
  - Return JSON response with structure:
    ```json
    {
      "summary": { ... },
      "processes": [
        {
          "process_name": "",
          "avg_wait_time": 0,
          "avg_wip_count": 0,
          "avg_machine_utilization": 0,
          "throughput": 0,
          "score": 0,
          "status": "Normal | Warning | Bottleneck",
          "reasons": [],
          "recommendations": []
        }
      ]
    }
    ```

### Frontend (React + Tailwind + Recharts)
- **Setup**: Vite + React.
- **Styling**: Tailwind CSS for a modern dashboard aesthetic.
- **Components**:
  - `FileUpload.jsx`, `SummaryCards.jsx`, `BottleneckTable.jsx`, `ProcessCharts.jsx`, `RecommendationPanel.jsx`, `Dashboard.jsx`.
- **Status Labels**:
  - Score 0: Normal / 정상
  - Score 1: Warning / 주의
  - Score 2 or more: Bottleneck / 병목

### Sample Data
- **`production_sample.csv`**: A crafted dataset featuring 5+ processes designed to trigger Normal, Warning, and Bottleneck statuses based on our rules.

## Keep MVP Simple
- No database.
- No Supabase.
- No real-time simulator.
- No machine learning yet.
- Focus strictly on CSV upload, analysis, dashboard visualization, and rule-based recommendations.
