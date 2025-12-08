"""LLM Service using Google Gemini for Interview Scenarios"""
import google.generativeai as genai
from typing import List, Dict, Literal, Any
import numpy as np
import logging
from app.core.config import settings
import json
from groq import Groq

from app.mcp.server import search_jobs
# Setup logging
logger = logging.getLogger(__name__)

InterviewerType = Literal["nice", "neutral", "mean"]

# Base interview instructions (common to all types)
BASE_INTERVIEW_INSTRUCTIONS = """Tu es un recruteur professionnel français qui mène un entretien d'embauche.

RÈGLES CRITIQUES - FEEDBACK CONCIS:
- Donne des feedbacks TRÈS COURTS (1-2 phrases maximum)
- NE PAS écrire de longs paragraphes de félicitations
- NE PAS dire "c'est excellent", "vous êtes génial", "parfait" à répétition
- Feedback format: "Bien." ou "Intéressant." puis PASSE À LA QUESTION SUIVANTE
- Exemple: "D'accord, je comprends. Parlons maintenant de..."

STRUCTURE DE L'ENTRETIEN:
- L'entretien doit durer environ 5 questions au total
- Compte mentalement les questions posées
- Après la 5ème question, conclus naturellement l'entretien
- Questions: 1) Présentation, 2) Expérience clé, 3) Compétences techniques, 4) Motivations, 5) Question de situation/défi

STYLE DE QUESTIONS:
- Questions directes et professionnelles
- Pas de questions trop longues
- Écoute les réponses et adapte-toi
- Pose des questions de suivi si nécessaire mais reste dans la limite de 5 questions totales"""

# Interviewer personality prompts
INTERVIEWER_PROMPTS = {
    "nice": """PERSONNALITÉ: Recruteur Bienveillant et Encourageant

Tu es chaleureux, positif et encourageant. Tu mets le candidat à l'aise.

COMPORTEMENT:
- Ton accueillant et amical
- Souris dans ta voix (utilise un langage positif)
- Encourage le candidat: "C'est très bien", "J'aime votre approche"
- Feedbacks positifs mais COURTS: "Super." puis question suivante
- Crée une atmosphère détendue et confortable
- Reformule positivement: "Intéressant, et si on parlait de..."

EXEMPLE DE STYLE:
❌ MAUVAIS: "Wow, c'est absolument fantastique ! Votre expérience est vraiment impressionnante et montre une grande maturité professionnelle. Je suis vraiment ravi d'entendre cela !"
✅ BON: "Très bien, j'apprécie votre franchise. Maintenant, parlez-moi d'un projet technique..."

IMPORTANT: Reste bienveillant mais CONCIS dans tes feedbacks.""",

    "neutral": """PERSONNALITÉ: Recruteur Professionnel et Objectif

Tu es neutre, factuel et professionnel. Tu évalues objectivement sans être ni trop chaleureux ni froid.

COMPORTEMENT:
- Ton professionnel et mesuré
- Feedbacks factuels et COURTS: "D'accord." puis question suivante
- Pas d'émotions excessives (ni trop positif ni négatif)
- Questions directes et claires
- Écoute attentive mais sans commentaires élaborés
- Transitions neutres: "Je vois. Passons à...", "Compris. Maintenant..."

EXEMPLE DE STYLE:
❌ MAUVAIS: "Merci pour cette réponse détaillée. C'est effectivement une approche intéressante qui démontre votre capacité d'analyse."
✅ BON: "D'accord. Parlez-moi d'une situation difficile que vous avez gérée."

IMPORTANT: Reste neutre et CONCIS dans tes feedbacks.""",

    "mean": """PERSONNALITÉ: Recruteur Exigeant et Direct

Tu es exigeant, critique et direct. Tu testes la résistance au stress du candidat.

COMPORTEMENT:
- Ton sec et direct, parfois légèrement sarcastique
- Feedbacks critiques mais COURTS: "Hmm." ou "On verra." puis question suivante
- Questions qui challengent le candidat
- Relève les faiblesses: "C'est tout ?", "Plutôt banal."
- Crée une légère pression (reste professionnel, pas insultant)
- Scepticisme dans les transitions: "Bien, et concrètement...", "Passons à autre chose."

EXEMPLE DE STYLE:
❌ MAUVAIS: "Votre réponse manque vraiment de substance et je dois dire que je m'attendais à beaucoup mieux de la part d'un candidat avec votre profil."
✅ BON: "Hmm, c'est vague. Donnez-moi un exemple concret avec des résultats chiffrés."

IMPORTANT: Sois exigeant mais garde des feedbacks COURTS. Ne sois pas méchant, juste direct et exigeant."""
}

def get_system_prompt(interviewer_type: InterviewerType, candidate_context: str = "", job_description: str = "") -> str:
    """Get the complete system prompt for the given interviewer type."""
    base_prompt = f"{BASE_INTERVIEW_INSTRUCTIONS}\n\n{INTERVIEWER_PROMPTS[interviewer_type]}"
    
    if job_description:
        base_prompt += f"\n\nDESCRIPTION DU POSTE:\n{job_description}\n\nINSTRUCTION: Tu dois mener cet entretien spécifiquement pour ce poste. Tes questions doivent évaluer l'adéquation du candidat avec cette description."

    if candidate_context:
        base_prompt += f"\n\nCONTEXTE DU CANDIDAT (CV):\n{candidate_context}\n\nINSTRUCTION: Utilise ce contexte pour poser des questions personnalisées sur l'expérience et les compétences du candidat."
    return base_prompt


class LLMService:
    def __init__(self):
        """Initialize with Google Gemini and Groq using settings from config."""
        logger.info("🔄 Initializing LLMService...")
        
        # Get API keys
        api_key = settings.GEMINI_API_KEY
        groq_api_key = settings.GROQ_API_KEY
        
        # Initialize Groq
        self.groq_client = None
        if groq_api_key:
            try:
                self.groq_client = Groq(api_key=groq_api_key)
                logger.info("✅ Groq client initialized successfully!")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Groq client: {str(e)}")
        else:
            logger.warning("⚠️ GROQ_API_KEY not configured. Groq features will not work.")

        if not api_key:
            logger.warning(
                "⚠️  GEMINI_API_KEY not configured. "
                "LLM features (Gemini) will not work. Add GEMINI_API_KEY to .env"
            )
            self.api_key = None
            self.client_ready = False
            return
        
        logger.info(f"✓ Found GEMINI_API_KEY: {api_key[:10]}...{api_key[-5:]}")
        
        try:
            genai.configure(api_key=api_key)
            self.api_key = api_key
            self.client_ready = True
            # Note: Model will be created per-session with appropriate system prompt
            logger.info("✅ Gemini client initialized successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini client: {str(e)}")
            self.client_ready = False
            self.api_key = None
    
    def _create_model(self, interviewer_type: InterviewerType = None, candidate_context: str = "", job_description: str = "", tools: List[Any] = None):
        """Create a Gemini model with the appropriate system prompt and tools."""
        if not self.client_ready:
            raise ValueError("Gemini client not initialized. Please set GEMINI_API_KEY in .env")
        
        system_prompt = None
        if interviewer_type:
            system_prompt = get_system_prompt(interviewer_type, candidate_context, job_description)
            
        model_config = {}
        if tools:
            model_config['tools'] = tools

        return genai.GenerativeModel(
            'gemini-1.5-flash',
            system_instruction=system_prompt,
            **model_config
        )

    def _create_grading_model(self, interviewer_type: InterviewerType):
        """Create a gemini model to grade the user responses"""
        system_prompt = get_system_prompt(interviewer_type)
        return genai.GenerativeModel(
            'gemini-1.5-flash',
            system_instruction=system_prompt,
            generation_config={
                "response_mime_type": "application/json"
            }
        )
    
    def get_initial_greeting(
        self, 
        candidate_name: str, 
        interviewer_type: InterviewerType,
        candidate_context: str = "",
        job_description: str = ""
    ) -> str:
        """
        Generate personalized initial greeting based on interviewer type.
        
        Args:
            candidate_name: The candidate's name
            interviewer_type: Type of interviewer (nice, neutral, mean)
            candidate_context: Context from resume
            job_description: Job description context
            
        Returns:
            Personalized greeting message
        """
        logger.info(f"👋 Generating greeting for {candidate_name} with {interviewer_type} interviewer")
        
        greetings = {
            "nice": f"""Bonjour {candidate_name} ! Je suis absolument ravi de vous rencontrer aujourd'hui. 

Je serai votre interlocuteur pour cet entretien et je veux que vous vous sentiez parfaitement à l'aise. Mon objectif est de découvrir qui vous êtes vraiment, vos talents et vos aspirations.

N'hésitez surtout pas à être vous-même - il n'y a pas de mauvaises réponses ici ! Je suis simplement curieux d'en apprendre plus sur vous.

Pour commencer, pourriez-vous vous présenter en quelques mots ? Parlez-moi de votre parcours.""",

            "neutral": f"""Bonjour {candidate_name}. 

Je serai votre interlocuteur aujourd'hui. L'objectif de cet entretien est d'évaluer votre profil, vos compétences et votre adéquation avec le poste.

Nous allons passer en revue votre expérience et vos motivations. Soyez précis dans vos réponses.

Commençons. Présentez-vous brièvement.""",

            "mean": f"""Bonjour {candidate_name}.

Je n'ai pas beaucoup de temps, alors allons droit au but. J'ai vu beaucoup de candidats cette semaine et franchement, peu m'ont impressionné.

J'attends des réponses concrètes, avec des exemples précis et des résultats mesurables. Pas de langue de bois.

Présentez-vous. Et soyez synthétique."""
        }
        
        return greetings[interviewer_type]
    
    async def chat(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]],
        interviewer_type: InterviewerType,
        candidate_context: str = "",
        job_description: str = ""
    ) -> str:
        """
        Send message to Gemini and get interviewer response.
        
        Args:
            message: Candidate's message
            conversation_history: List of previous messages
            interviewer_type: Type of interviewer
            candidate_context: Context from resume
            job_description: Job description context
            
        Returns:
            Interviewer's response text
        """
        logger.info(f"💬 Processing candidate response with {interviewer_type} interviewer")
        
        try:
            # Create model with appropriate personality and context
            model = self._create_model(interviewer_type, candidate_context, job_description)
            
            # Convert conversation history to Gemini format
            history = []
            if conversation_history:
                for msg in conversation_history:
                    role = "model" if msg["role"] == "assistant" else msg["role"]
                    history.append({
                        "role": role,
                        "parts": [msg["content"]]
                    })
            
            # Start chat with history
            chat = model.start_chat(history=history)
            
            # Send message and get response
            response = chat.send_message(message)
            response_text = response.text
            
            logger.info(f"✅ Got {interviewer_type} interviewer response ({len(response_text)} chars)")
            return response_text
            
        except Exception as e:
            logger.error(f"❌ Chat error: {str(e)}")
            raise
    
    async def grade_response(
    self,
    question: str,
    answer: str,
    interviewer_type: InterviewerType
    ) -> Dict[str, any]:
        """
        Grade a candidate's response to an interview question.
        
        Args:
            question: The interview question asked
            answer: The candidate's answer
            interviewer_type: Type of interviewer (affects grading strictness)
            
        Returns:
            Dict with 'grade' (1-10) and 'feedback' (str)
        """
        logger.info(f"📊 Grading response with {interviewer_type} interviewer...")
        
        try:
            # Create grading model with JSON output
            model = self._create_grading_model(interviewer_type)
            
            # Grading prompt with strict JSON schema
            grading_prompt = f"""Tu dois évaluer la réponse d'un candidat à une question d'entretien.

                                QUESTION POSÉE:
                                {question}

                                RÉPONSE DU CANDIDAT:
                                {answer}

                                CONSIGNES D'ÉVALUATION:
                                - Note de 1 à 10 (1 = très mauvais, 10 = excellent)
                                - Feedback concis en français (2-3 phrases maximum)
                                - Évalue: pertinence, clarté, exemples concrets, structure

                                Réponds UNIQUEMENT avec ce format JSON exact:
                                {{
                                "grade": 8,
                                "feedback": "Réponse claire avec un bon exemple. Manque de chiffres précis."
                                }}"""

            # Generate response
            response = model.generate_content(grading_prompt)
            
            # Parse JSON response
            result = json.loads(response.text)
            
            logger.info(f"✅ Response graded: {result['grade']}/10")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse JSON response: {str(e)}")
            logger.error(f"Raw response: {response.text}")
            # Fallback response
            return {
                "grade": 5,
                "feedback": "Erreur lors de l'évaluation de la réponse."
            }
        except Exception as e:
            logger.error(f"❌ Grading error: {str(e)}")
            raise

    async def end_interview(
        self, 
        conversation_history: List[Dict[str, str]],
        interviewer_type: InterviewerType
    ) -> Dict[str, Any]:
        """
        Generate structured feedback and analysis for the interview.
        
        Args:
            conversation_history: Full conversation history
            interviewer_type: Type of interviewer
            
        Returns:
            Dict containing structured feedback (score, strengths, weaknesses, tips, overall_comment)
        """
        logger.info(f"📝 Generating structured interview feedback with {interviewer_type} interviewer...")
        
        try:
            # Create model with JSON output configuration
            model = self._create_grading_model(interviewer_type)
            
            history = []
            for msg in conversation_history:
                role = "model" if msg["role"] == "assistant" else msg["role"]
                history.append({
                    "role": role,
                    "parts": [msg["content"]]
                })
            
            # We don't use chat history directly for generation to avoid context limit issues or confusion,
            # but we construct a prompt that includes the conversation transcript if needed.
            # However, Gemini's chat mode is best. Let's stick to chat but with a specific final prompt.
            # Actually, for JSON output, it's safer to use generate_content with the full transcript
            # or continue the chat with a specific instruction.
            # Let's continue the chat but enforce JSON via the model config we created in _create_grading_model.
            
            # Re-creating chat session might be tricky if we want to enforce JSON on the *next* message.
            # _create_grading_model uses a fresh model. Let's feed the history as context in the prompt
            # or just use the chat method if we can set generation config dynamically.
            # Gemini Python SDK allows generation_config in send_message? Yes.
            
            # Let's use the existing chat method but with a new model that enforces JSON.
            # We need to reconstruct the chat on the new JSON-enforcing model.
            
            chat = model.start_chat(history=history)
            
            feedback_prompt = f"""IMPORTANT: L'entretien est TERMINÉ.
            
            Ta tâche est de générer un FEEDBACK STRUCTURÉ au format JSON.
            
            Analyse la performance du candidat selon le style '{interviewer_type}'.
            
            Format JSON attendu:
            {{
                "score": 8,  // Note globale sur 10
                "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
                "weaknesses": ["Point faible 1", "Point faible 2"],
                "tips": ["Conseil actionnable 1", "Conseil actionnable 2"],
                "overall_comment": "Un paragraphe de résumé général sur la performance..."
            }}
            
            Consignes par style:
            - nice: Ton encourageant, souligne le potentiel.
            - neutral: Ton factuel, professionnel et objectif.
            - mean: Ton exigeant, pointe directement les lacunes.
            
            Génère UNIQUEMENT le JSON."""
            
            response = chat.send_message(feedback_prompt)
            
            try:
                feedback_data = json.loads(response.text)
                logger.info("✅ Structured interview feedback generated")
                return feedback_data
            except json.JSONDecodeError:
                logger.error(f"❌ Failed to parse feedback JSON: {response.text}")
                # Fallback
                return {
                    "score": 5,
                    "strengths": ["Participation à l'entretien"],
                    "weaknesses": ["Erreur de génération du feedback"],
                    "tips": ["Veuillez réessayer plus tard"],
                    "overall_comment": response.text
                }
            
        except Exception as e:
            logger.error(f"❌ Error generating feedback: {str(e)}")
            raise

    async def compute_similarity_ranking(
        self,
        candidate_profile: str,
        jobs: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Rerank jobs using Embeddings and Cosine Similarity (RAG approach).
        """
        logger.info(f"⚖️ Reranking {len(jobs)} jobs using Embeddings...")
        
        if not jobs:
            return []

        try:
            # 1. Embed Candidate Profile
            # We use the text-embedding-004 model for better performance
            profile_embedding_resp = genai.embed_content(
                model="models/text-embedding-004",
                content=candidate_profile,
                task_type="retrieval_query"
            )
            profile_vector = np.array(profile_embedding_resp['embedding'])

            # 2. Embed Jobs (Batching if necessary, but genai handles lists)
            # Construct texts to embed: "Title: ... Description: ..."
            job_texts = []
            for job in jobs:
                title = job.get("intitule", "")
                desc = job.get("description", "")[:1000] # Truncate for safety
                text = f"Title: {title}\nDescription: {desc}"
                job_texts.append(text)

            # Embed all jobs in one go (or batches of 100 if list is huge)
            # API limit check might be needed for production, but fine for <100 jobs
            jobs_embedding_resp = genai.embed_content(
                model="models/text-embedding-004",
                content=job_texts,
                task_type="retrieval_document"
            )
            
            job_vectors = np.array(jobs_embedding_resp['embedding'])

            # 3. Compute Cosine Similarity
            # Cosine Sim = (A . B) / (||A|| * ||B||)
            # Since embeddings are usually normalized, dot product might suffice, 
            # but let's be mathematically correct.
            
            norm_profile = np.linalg.norm(profile_vector)
            
            reranked_jobs = []
            for i, job in enumerate(jobs):
                job_vector = job_vectors[i]
                norm_job = np.linalg.norm(job_vector)
                
                if norm_profile == 0 or norm_job == 0:
                    similarity = 0.0
                else:
                    similarity = np.dot(profile_vector, job_vector) / (norm_profile * norm_job)
                
                # Normalize score to 0-100 for frontend consistency
                score = int(similarity * 100)
                
                job["relevance_score"] = score
                job["relevance_reasoning"] = "Correspondance IA basée sur votre profil"
                reranked_jobs.append(job)

            # 4. Sort
            reranked_jobs.sort(key=lambda x: x["relevance_score"], reverse=True)
            
            logger.info("✅ Jobs reranked via Embeddings")
            return reranked_jobs

        except Exception as e:
            logger.error(f"❌ Error in embedding reranking: {str(e)}")
            # Fallback: return original list with 0 score
            for job in jobs:
                job["relevance_score"] = 0
                job["relevance_reasoning"] = "Error in ranking"
            return jobs


    async def extract_keywords_from_query(self, query: str, user_context: str = "") -> Dict[str, Any]:
        """
        Extract search keywords and location from a natural language query using Groq/Llama3,
        considering the user's professional context.
        """
        logger.info(f"🔍 Extracting keywords from query: '{query}' with context length: {len(user_context)}")
        
        try:
            if not self.groq_client:
                raise ValueError("Groq client not initialized")

            prompt = f"""Role: You are an expert Technical Recruiter in France.
                        Task: Analyze the user's profile and query to generate optimized search parameters for the French job market (France Travail / APEC).

                        User Profile: {user_context}
                        User Query: "{query}"

                        Instructions:
                        1. KEYWORDS: Extract the core job role and translate it into **Standard French Market Titles**.
                        - Convert "Software Engineer" to "Ingénieur Logiciel" OR "Développeur".
                        - Convert "Senior" to "Senior" OR "Confirmé".
                        - Convert "Junior" to "Débutant" OR "Junior".
                        2. EXPANSION: Generate an array of 3 distinct search variations ranging from specific to broad.
                        - Variation 1: Precise Title (e.g., "Développeur React Senior")
                        - Variation 2: Broader Title (e.g., "Ingénieur Frontend")
                        - Variation 3: Tech Stack Focus (e.g., "React.js Confirmé")
                        3. LOCATION: Extract the city name or zip code if explicitly mentioned.
                        - CRITICAL: IF NO LOCATION IS MENTIONED IN THE QUERY, Do not include it.
                        - DO NOT assume specific cities unless the user asks.

                        Output JSON format strictly:
                        {{
                        "keywords": ["Variation 1", "Variation 2", "Variation 3"],
                        "location": "Paris" or null,
                        }}"""
            
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            result_text = completion.choices[0].message.content
            result = json.loads(result_text)
            
            logger.info(f"✅ Extracted: {result}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error extracting keywords with Groq: {str(e)}")
            # Fallback
            return {"keywords": query.split()[:3], "location": None}

    async def search_with_tools(self, user_query: str, user_context: str, tools: List[Any]) -> List[Dict]:
        """
        Perform a search using Groq tool calling (OpenAI compatible).
        """
        logger.info(f"🛠️ Starting search with tools (Groq) for query: '{user_query}'")
        
        try:
            if not self.groq_client:
                raise ValueError("Groq client not initialized")
 
            # OpenAI/Groq Tool Definition
            tools_schema = [
                {
                    "type": "function",
                    "function": {
                        "name": "search_jobs",
                        "description": "Search for jobs in France using France Travail API with advanced filters.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string", 
                                    "description": "Job title, keywords, or domain (e.g. 'Développeur Python')"
                                },
                                "location": {
                                    "type": "string",
                                    "description": "City name or zip code (e.g. 'Paris', '69002'). Omit this parameter if no location is specified."
                                },
                                "contract_type": {
                                    "type": "string",
                                    "enum": ["CDI", "CDD", "MIS", "ALE", "DDI", "DIN"],
                                    "description": "Type of contract. Omit if not specified."
                                },
                                "is_full_time": {
                                    "type": "boolean",
                                    "description": "Set to true if user specifically asks for full-time work. Omit otherwise."
                                },
                                "sort_by": {
                                    "type": "string",
                                    "enum": ["date", "relevance"],
                                    "description": "Sort order. Omit if not specified."
                                }
                            },
                            "required": ["query"]
                        }
                    }
                }
            ]

            messages = [
                {
                    "role": "system",
                    "content": f"You are a Job Search Agent. \nContext: {user_context}\n\nTask: Search for relevant jobs. Use the 'search_jobs' tool. Analyze the user's query and profile to pick the best keywords (in French) and location.\n\nCRITICAL: DO NOT INVENT A LOCATION. If the user doesn't specify one, OMIT the location parameter entirely.\n\nYou can also infer contract type (CDI/CDD) or full-time preference if explicitly stated."
                },
                {
                    "role": "user",
                    "content": user_query
                }
            ]

            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=tools_schema,
                tool_choice="auto",
                max_tokens=4096 
            )

            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls
            
            all_found_jobs = []

            if tool_calls:
                logger.info(f"🤖 Groq decided to call {len(tool_calls)} tools")
                
                # Execute tool calls
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    if function_name == "search_jobs":
                        function_args = json.loads(tool_call.function.arguments)
                        logger.info(f"📞 Calling search_jobs with: {function_args}")
                        
                        # Call the tool function (it's underlying function is async)
                        # We pass keywords and location. search_jobs is a FastMCP tool, so use .fn
                        query = function_args.get("query")
                        location = function_args.get("location")
                        contract_type = function_args.get("contract_type")
                        is_full_time = function_args.get("is_full_time")
                        sort_by = function_args.get("sort_by")
                        
                        # Call the imported function
                        # search_jobs returns a JSON string
                        jobs_json = await search_jobs.fn(
                            query=query, 
                            location=location,
                            contract_type=contract_type,
                            is_full_time=is_full_time,
                            sort_by=sort_by
                        )
                        
                        try:
                            jobs = json.loads(jobs_json)
                            if isinstance(jobs, list):
                                all_found_jobs.extend(jobs)
                        except Exception as e:
                            logger.error(f"❌ Failed to parse jobs JSON from tool: {e}")

            logger.info(f"✅ Extracted {len(all_found_jobs)} jobs from tool execution")
            return all_found_jobs
            
        except Exception as e:
            logger.error(f"❌ Error in search_with_tools (Groq): {str(e)}")
            return []

# Singleton instance - initialized on first import
_llm_service_instance = None

def get_llm_service() -> LLMService:
    """Get or create the LLM service singleton."""
    global _llm_service_instance
    if _llm_service_instance is None:
        logger.info("🚀 Creating llm_service singleton...")
        _llm_service_instance = LLMService()
        logger.info("✅ llm_service singleton created!")
    return _llm_service_instance

# For convenience
llm_service = get_llm_service()