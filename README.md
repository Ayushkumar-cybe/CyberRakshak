# 🛡️ CyberRakshak: Centralized Vulnerability Detection & Intelligent Query Interface

## 🌟 Project Overview

CyberRakshak is a comprehensive cybersecurity platform designed to eliminate **tool sprawl** and combat the global **cybersecurity skills gap** by integrating multiple industry-standard security scanners into one centralized system. It provides real-time vulnerability analysis, attack path mapping, and conversational AI-driven remediation guidance.

* **Problem:** Security teams are overwhelmed managing disparate tools, leading to massive talent gaps and slow breach containment.
* **Solution:** CyberRakshak automates the entire vulnerability lifecycle—from scanning to intelligent analysis—to accelerate remediation and simplify security management.
* **Hackathon ID:** 25234.
* **Theme:** Smart Automation.

---

## ✅ Feature List

The platform provides a unified experience built around the data pipeline:

| Feature | Description |
| :--- | :--- |
| **Multi-Scanner Integration** | Integrated execution of multiple open-source tools: **Nmap, Nuclei, Nikto, OWASP ZAP, Metasploit, and OpenVAS**. |
| **Intelligent Query Interface (VulnAI)** | A **RAG-based chatbot** that instantly answers questions, provides remediation steps, and explains complex attack paths. |
| **Automated Attack Path Analysis** | Generates graph visualization of potential exploitation chains (using NetworkX). |
| **Vulnerability Intelligence** | Automated enrichment of scan results with real-time data from **NVD & ExploitDB**. |
| **Real-time Scan Feed** | Live progress tracking and log streaming during scans. |
| **User Access Control** | Implements secure **JWT Authentication** and **RBAC** (Role-Based Access Control). |

---

## 💻 Installation Steps (Quick Start)

To get CyberRakshak running locally, you must use Docker Compose to manage the interdependent services (API, Workers, Database, RabbitMQ).

### Prerequisites
* **Git**
* **Docker** and **Docker Compose**
* **Python 3.8+**

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CyberRakshak
   ```

2. Start the services using Docker Compose:
   ```bash
   cd backend
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - RabbitMQ Management: http://localhost:15672

---

## ⚙️ Technology Stack

CyberRakshak utilizes a robust, modern, and scalable technology stack:

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend / UI** | React (with TypeScript), Tailwind CSS | Presentation Layer; intuitive dashboard and visualization. |
| **Backend / API** | Python (FastAPI) | Gateway Layer; handles user authentication and data orchestration. |
| **Task Queue** | Celery + RabbitMQ | Asynchronous execution of scans and resource-intensive tasks. |
| **AI / RAG** | Llama (LLM) + FAISS | Conversational engine grounded by vulnerability data. |
| **Database** | PostgreSQL | Persistent storage for normalized vulnerability data and audit logs. |

---

## 📑 API Documentation (Key Endpoints)

The CyberRakshak API is structured around core security functionality using **FastAPI**. Full, interactive documentation (Swagger UI/ReDoc) is generated automatically once the backend service is running.

| Endpoint | Method | Function | Required Role |
| :--- | :--- | :--- | :--- |
| **Authentication** | | | |
| `/auth/login` | `POST` | Authenticates user and returns JWT access tokens. | All Users |
| **Scan Management** | | | |
| `/api/scan/start` | `POST` | Initiates a new scan job via the Celery task queue (requires `consent: true`). | Analyst, Admin |
| `/api/scan/status/{id}`| `GET` | Retrieves the current status and progress of an asynchronous scan job. | All Users |
| **Reporting & Analysis** | | | |
| `/api/report/{id}` | `GET` | Fetches the full normalized and enriched vulnerability report. | All Users |
| `/api/attackpath/{id}`| `GET` | Retrieves nodes, edges, and paths for attack chain visualization (NetworkX output). | Analyst, Admin |
| **Intelligent Query** | | | |
| `/api/chat/query` | `POST` | Submits natural language queries to the VulnAI RAG assistant. | Analyst, Admin |
| **System/Admin** | | | |
| `/api/audit/logs` | `GET` | Retrieves logs of all sensitive system actions (e.g., scan start, login attempts). | Admin Only |

---

## 🏗️ Architecture Diagram

The system operates on a microservices model with separate workers for long-running jobs and a consolidated backend for analysis. 
![Alt Text for Image](https://raw.githubusercontent.com/SIH2025-Org/CyberRakshak/refs/heads/developer-docs/docs/architechture%20digram.png?token=GHSAT0AAAAAADPCRFUYPVQHU2K34TYAXV6I2JSQIDA)

**Key Flow:** Client initiates scan via **Web Frontend** → Request hits the **Backend API** → API enqueues job to **Scan Orchestrator** → **Celery Workers** (Nmap, Nikto, Nuclei) execute scans → Findings are stored in **PostgreSQL** → **RAG Chat Service** pulls data for intelligent querying.

---

## 🛠️ Project Structure (Detailed)

The CyberRakshak repository is meticulously organized into logical directories, ensuring clarity, maintainability, and efficient collaboration across different functional areas.

```
CyberRakshak/
│
├── backend/
│ ├── app/
│ │ ├── api/                              # All API route handlers
│ │ ├── core/                             # Config, logging, settings
│ │ ├── models/                           # SQLAlchemy models
│ │ ├── schemas/                          # Pydantic models
│ │ ├── services/                         # Business logic (scan, intel, attack graph)
│ │ ├── workers/                          # Celery async tasks
│ │ ├── scanners/                         # Nmap, Nuclei, Nikto runners
│ │ ├── normalizer/                       # Parsing & unified JSON generation
│ │ ├── enrichment/                       # CVE, CVSS, ExploitDB, intel merging
│ │ ├── attack_graph/                     # Attack graph builder, ranking, path finder
│ │ ├── rag/                              # RAG engine inside backend (production pipeline)
│ │ │ ├── embedder.py
│ │ │ ├── retriever.py
│ │ │ ├── vector_store.py
│ │ │ ├── llm.py
│ │ │ └── rag_pipeline.py
│ │ ├── security/                          # JWT auth, RBAC (future)
│ │ ├── utils/                             # Validators, helpers, logger
│ │ └── init.py
│ │
│ ├── main.py                              # FastAPI entrypoint
│ ├── celery_app.py                        # Celery setup
│ ├── requirements.txt
│ └── README.md
│
├── frontend/
│ ├── src/
│ │ ├── pages/                             # Dashboards, scans, reports, chat
│ │ ├── components/                        # UI components
│ │ ├── graphs/                            # React Flow attack graph components
│ │ ├── services/                          # Axios API service layer
│ │ ├── hooks/                             # Custom hooks
│ │ ├── context/                           # Global state (auth, preferences)
│ │ ├── styles/                            # Tailwind / CSS
│ │ └── utils/                             # Frontend utilities
│ ├── public/
│ ├── package.json
│ └── README.md
│
├── ai/                                    # AI development workspace (EXPERIMENT ZONE)
│ ├── notebooks/                           # Jupyter notebooks for testing LLM, embeddings
│ ├── embeddings/                          # Scripts to generate embeddings
│ ├── index/                               # FAISS index creation, saving, loading
│ ├── model/                               # Llama model loading, quantization
│ ├── pipeline/                            # Full experimental RAG flow (prototype)
│ ├── evaluation/                          # BLEU, ROUGE, accuracy testing
│ └── README.md
│
├── scanner/                               # Optional standalone CLI wrappers
│ ├── nmap_runner.py
│ ├── nuclei_runner.py
│ ├── nikto_runner.py
│ ├── sanitizer.py
│ └── README.md
│
├── design/                                # UI/UX, Figma, branding
│ ├── images/
│ ├── prototypes/                          # Figma screens, PNG renders
│ └── branding/                            # Logo, color palette
│
├── infra/                                 # Deployment & DevOps
│ ├── docker/
│ │ ├── backend.Dockerfile
│ │ ├── worker.Dockerfile
│ │ ├── frontend.Dockerfile
│ │ └── docker-compose.yml
│ ├── kubernetes/                          # K8s manifests
│ ├── nginx/
│ ├── systemd/                             # Linux service files
│ ├── scripts/                             # Deployment scripts
│ └── README.md
│
├── docs/                                  # Complete documentation
│ ├── README.md                            # Overview
│ ├── ARCHITECTURE.md                      # Full architecture explanation
│ ├── SCANNER_PIPELINE.md                  # Nmap/Nuclei/Nikto pipelines
│ ├── NORMALIZATION.md                     # Unified JSON schema documentation
│ ├── CVE_CVSS_FLOW.md                     # Intel pipeline
│ ├── ATTACK_GRAPH.md                      # Attack graph model
│ ├── RAG_ASSISTANT.md                     # RAG documentation
│ ├── API_REFERENCE.md                     # Swagger-like API index
│ ├── DEPLOYMENT.md                        # Instructions for running system
│ ├── SECURITY.md                          # Input validation, auth, RBAC
│ └── DESIGN_DECISIONS.md                  # Why choices were made
│
├── reports/                               # Generated reports (ignored in git)
├── outputs/                               # Raw scanner outputs (ignored in git)
├── scripts/                               # Helper scripts (dev setup, tools)
│ ├── setup_dev.sh
│ ├── init_db.py
│ └── generate_embeddings.py
│
├── .github/
│ ├── ISSUE_TEMPLATE/
│ │ ├── bug_report.md
│ │ └── feature_request.md
│ ├── pull_request_template.md
│ ├── workflows/
│ │ ├── frontend-ci.yml
│ │ ├── backend-ci.yml
│ │ └── lint.yml
│ └── CODEOWNERS
│
├── .gitignore
└── README.md                                # Root introduction + setup
```
---

## ⚙️ Automated Attack Path Analysis

The Attack Path Engine is a core differentiating feature of CyberRakshak, utilizing graph theory to estimate the most probable exploitation chains rather than simply providing a list of vulnerabilities.



**Key Workflow Components:**

* **Nodes:** Represent individual vulnerabilities, misconfigurations, or critical services.
* **Edges:** Represent logical connections or dependencies between nodes, indicating a possible exploitation step or privilege escalation.
* **Analysis:** The engine applies algorithms like **k-shortest paths** to find the most efficient path an attacker could take to reach a critical asset.
* **Output:** The final result is a JSON payload consumed by the frontend's **React-Flow** components for visualization.

---
