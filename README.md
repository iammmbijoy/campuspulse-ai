# CampusPulse AI

CampusPulse AI is a full-stack campus incident reporting and maintenance management system. It helps students and faculty report campus issues in Bangla, English, or Banglish (with optional photos), automatically categorizes and prioritizes those reports using AI, assigns the right technician, and sends real-time notifications through Telegram.

## What the System Does

- **Role-Based Access Control (RBAC):** Only users with an official university email (`@seu.edu.bd`) can register. Students can sign up directly, while faculty and technicians need a staff access code. Admin accounts cannot be created through public signup and must be assigned from the backend.
- **Faculty Priority Boost:** Classroom and lab issues reported by faculty members are automatically elevated to at least High priority so ongoing classes are not disrupted.
- **AI Triage and Checklist Generation:** When a report is submitted, the AI detects the language, identifies the category (IT and Network, Electrical and AC, Plumbing and Water, Lab Equipment, or General), sets the urgency level, and creates a step-by-step troubleshooting checklist for the technician.
- **Duplicate Report Merging:** If multiple people report the same problem in the same building and room, the system merges them into one main ticket instead of creating duplicate tasks.
- **Automatic Technician Assignment:** Tickets are routed to on-duty technicians based on their specialization and current workload.
- **Telegram Alerts for Technicians:** On-duty technicians can join the official Telegram operations group directly from their profile settings to receive instant task assignments, SLA warnings, and resolution updates.
- **SLA Monitoring and Escalation:** A scheduled background check flags tickets that pass their resolution deadline and alerts the admin dashboard.
- **Admin Dashboard and Heatmap:** Campus administrators can view overall ticket metrics, average resolution times, technician workloads, student feedback ratings, and a building-by-building issue heatmap.
- **Proof of Work and Ratings:** Technicians upload resolution notes and photos after fixing an issue, and the person who reported it can rate the fix from 1 to 5 stars.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, Lucide Icons
- **Backend:** Python, Django, Django REST Framework, SimpleJWT
- **Database:** PostgreSQL / SQLite
- **AI and Messaging:** Google Gemini / Groq API, Telegram Bot API

## How to Run Locally

### 1. Backend Setup

Open a terminal in the `backend` folder and set up the virtual environment:

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```
