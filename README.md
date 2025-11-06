# Interview Practice Platform

An AI-powered SaaS platform for job seekers to practice interviews in French.

## Features (Planned)

- 🎯 Multiple interview types (technical, behavioral, case study)
- 🎭 Different interviewer personalities (friendly, strict, neutral)
- 🎤 Voice-based interviews using speech-to-text and text-to-speech
- 📊 Detailed feedback and analysis on answers
- 🇫🇷 French language support

## Tech Stack

**Backend:**
- FastAPI
- SQLAlchemy
- SQLite (development) / PostgreSQL (production)
- OpenAI Whisper (speech-to-text)
- ElevenLabs/OpenAI TTS (text-to-speech)
- Anthropic Claude (interview generation & analysis)

**Frontend:**
- React
- React Router
- Tailwind CSS

## Setup

### Prerequisites

- Python 3.11+ (3.13 recommended)
- Node.js 18+ (for frontend)

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/interview-platform.git
cd interview-platform/backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from template:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       └── router.py
│   ├── core/
│   │   └── config.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Development Roadmap

- [x] Basic FastAPI setup
- [x] Interview session endpoints
- [ ] Database models
- [ ] User authentication
- [ ] Speech-to-text integration
- [ ] Text-to-speech integration
- [ ] AI interview engine
- [ ] Answer analysis and feedback
- [ ] Frontend React app

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
