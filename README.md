# 🤖 AI Appointment Booking Agent

A conversational AI assistant that helps users schedule appointments using natural language. It intelligently interacts with users to understand intent, checks availability from Google Calendar, and books meetings—all through a clean chat interface.

## 🚀 Tech Stack
- **Frontend**: Streamlit – interactive chat interface  
- **Backend**: FastAPI – handles API requests and LangGraph agent logic  
- **Agent Framework**: LangGraph – manages the conversation flow  
- **Calendar Integration**: Google Calendar API – for availability and bookings  
- **OAuth2**: Google authentication for calendar access  

## 🎯 Features
- 💬 Understands prompts like:
  - "Book a call for tomorrow afternoon"
  - "Do you have any time on Friday?"
  - "Schedule a meeting next week between 3–5 PM"
- 🧠 Manages conversation flow with LangGraph (clarifies time/date, fallback handling)
- 📆 Checks calendar availability, suggests open slots, and confirms bookings
- 🌐 Clean Streamlit interface with user input, chat history, and booking confirmation

## 🛠 Setup Instructions
1. **Google Calendar API**
   - Enable Google Calendar API from [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth credentials (Desktop App) and download `credentials.json`
     
2. **Environment Setup**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
3.Run FastAPI Backend

bash
Copy
Edit
cd backend
uvicorn main:app --reload

4. Run Streamlit Frontend
bash
Copy
Edit
cd frontend
streamlit run streamlit_app.py
📁 Project Structure
pgsql
Copy
Edit
├── backend/
│   ├── main.py
│   ├── google_calendar.py
│   └── langgraph_agent.py
├── frontend/
│   └── streamlit_app.py
├── credentials.json       # OAuth2 (DO NOT COMMIT)
├── token.json             # OAuth token (DO NOT COMMIT)
├── requirements.txt
├── .gitignore
└── README.md

this website live at - https://clinquant-toffee-114be4.netlify.app/
