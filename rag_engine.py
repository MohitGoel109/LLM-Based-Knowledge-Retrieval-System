import os
import requests
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# ── Configuration ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "qwen3:8b"
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_TIMEOUT = 300  # seconds — CPU inference can be slow

# Use cached model to avoid hanging on HuggingFace metadata checks
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

# ── Slang / Abbreviation Dictionary ───────────────────────────
# Maps common student slang and internet abbreviations to their
# full forms so both retrieval and the LLM see clean text.
import re

SLANG_MAP = {
    # ── Single-letter replacements (careful word boundaries) ─────
    r'\bu\b': 'you',
    r'\br\b': 'are',
    r'\bn\b': 'and',
    r'\by\b': 'why',
    r'\bk\b': 'ok',

    # ── Common internet abbreviations ────────────────────────────
    r'\bppl\b': 'people',
    r'\bur\b': 'your',
    r'\bb4\b': 'before',
    r'\b2\b': 'to',
    r'\b4\b': 'for',
    r'\bbc\b': 'because',
    r'\btho\b': 'though',
    r'\bngl\b': 'not gonna lie',
    r'\bfr\b': 'for real',
    r'\bong\b': 'on god',
    r'\bsrsly\b': 'seriously',
    r'\big\b': 'I guess',
    r'\birl\b': 'in real life',
    r'\bdm\b': 'direct message',
    r'\bnvm\b': 'never mind',
    r'\bikr\b': 'I know right',
    r'\bidc\b': "I don't care",
    r'\btldr\b': "too long didn't read",
    r'\basap\b': 'as soon as possible',
    r'\btba\b': 'to be announced',
    r'\beta\b': 'estimated time of arrival',
    r'\bbff\b': 'best friend forever',
    r'\bfomo\b': 'fear of missing out',
    r'\byk\b': 'you know',
    r'\bidk\b': "I don't know",
    r'\bimo\b': 'in my opinion',
    r'\bbtw\b': 'by the way',
    r'\bfyi\b': 'for your information',
    r'\bafaik\b': 'as far as I know',
    r'\btbh\b': 'to be honest',
    r'\brn\b': 'right now',
    r'\bpls\b': 'please',
    r'\bplz\b': 'please',
    r'\bthx\b': 'thanks',
    r'\bty\b': 'thank you',
    r'\bnp\b': 'no problem',
    r'\bwdym\b': 'what do you mean',
    r'\bhmu\b': 'let me know',
    r'\blmk\b': 'let me know',
    r'\bbrb\b': 'be right back',
    r'\bomg\b': 'oh my god',
    r'\bsmh\b': 'shaking my head',
    r'\bgoat\b': 'greatest of all time',
    r'\bw/\b': 'with',
    r'\bw/o\b': 'without',
    r'\bb/w\b': 'between',

    # ── Contractions / informal speech ───────────────────────────
    r'\baint\b': "isn't",
    r'\bwanna\b': 'want to',
    r'\bgonna\b': 'going to',
    r'\bgotta\b': 'got to',
    r'\bkinda\b': 'kind of',
    r'\bsorta\b': 'sort of',
    r'\blemme\b': 'let me',
    r'\bgimme\b': 'give me',
    r'\bdunno\b': "don't know",

    # ── Gen Z slang ──────────────────────────────────────────────
    r'\bgoated\b': 'greatest of all time',
    r'\bvibe\b': 'atmosphere',
    r'\bsus\b': 'suspicious',
    r'\bcap\b': 'lie',
    r'\bno cap\b': 'seriously',
    r'\bbet\b': 'ok agreed',
    r'\bslay\b': 'amazing',
    r'\blit\b': 'amazing',
    r'\blowkey\b': 'somewhat secretly',
    r'\bhighkey\b': 'very much openly',
    r'\bmid\b': 'mediocre',
    r'\bbased\b': 'authentic',
    r'\bfire\b': 'amazing',
    r'\bbussin\b': 'really good',
    r'\bperiodt\b': 'period',
    r'\bdeadass\b': 'seriously',
    r'\bsimp\b': 'someone overly attentive',
    r'\bstan\b': 'superfan',
    r'\byeet\b': 'throw',
    r'\bw\b': 'win',
    r'\bl\b': 'loss',
    r'\bratio\b': 'overwhelm',
    r'\bclout\b': 'influence',
    r'\bdrip\b': 'style',
    r'\bflex\b': 'show off',
    r'\bghosted\b': 'stopped responding',
    r'\bvibe check\b': 'assessment',
    r'\btea\b': 'gossip',
    r'\bshade\b': 'disrespect',
    r'\bsnatched\b': 'attractive',
    r'\bsavage\b': 'bold',
    r'\bextra\b': 'over the top',
    r'\bbasic\b': 'unoriginal',
    r'\bbruh\b': 'bro',
    r'\bfam\b': 'family',
    r'\bbestie\b': 'best friend',
    r'\bbae\b': 'before anyone else',
    r'\bship\b': 'want together',
    r'\bcope\b': 'deal with it',
    r'\brent free\b': 'constantly thinking about',
    r'\bate\b': 'did amazing',
    r'\bunderstood the assignment\b': 'did great',
    r'\bmain character\b': 'protagonist energy',
    r'\bick\b': 'turn off',
    r'\bvalid\b': 'understandable',
    r'\btoxic\b': 'harmful',
    r'\bred flag\b': 'warning sign',
    r'\bgreen flag\b': 'positive sign',
    r'\bsituationship\b': 'undefined relationship',
    r'\bera\b': 'phase',
    r'\bdelulu\b': 'delusional',

    # ── Shorthand / abbreviations ────────────────────────────────
    r'\babt\b': 'about',
    r'\bgovt\b': 'government',
    r'\bdept\b': 'department',
    r'\binfo\b': 'information',
    r'\buni\b': 'university',
    r'\bprof\b': 'professor',
    r'\bsem\b': 'semester',
    r'\bsup\b': "what's up",
    r'\bcoz\b': 'because',
    r'\bdat\b': 'that',
    r'\bdis\b': 'this',
    r'\bda\b': 'the',
    r'\bdey\b': 'they',
    r'\bwid\b': 'with',
    r'\bthru\b': 'through',
    r'\bcud\b': 'could',
    r'\bshud\b': 'should',
    r'\bwud\b': 'would',
    r'\bluv\b': 'love',
    r'\bhv\b': 'have',
    r'\bgt\b': 'got',
    r'\bmsg\b': 'message',
    r'\bpic\b': 'picture',
    r'\bmins\b': 'minutes',
    r'\bhrs\b': 'hours',
    r'\bacad\b': 'academic',
    r'\badmin\b': 'administration',
    r'\blib\b': 'library',
    r'\bcantu\b': 'canteen',
    r'\bhosty\b': 'hostel',

    # ── Hindi / Hinglish terms ───────────────────────────────────
    r'\bkya\b': 'what is',
    r'\bkab\b': 'when is',
    r'\bkahan\b': 'where is',
    r'\bkitna\b': 'how much is',
    r'\bkaisa\b': 'how is',
    r'\bbhai\b': '',
    r'\byaar\b': '',
    r'\baccha\b': 'ok good',
    r'\btheek\b': 'ok fine',
    r'\bnahi\b': 'no not',
    r'\bhaan\b': 'yes',
    r'\baur\b': 'and also',
    r'\bmatlab\b': 'meaning',
    r'\bpadhai\b': 'studies',
    r'\bpaisa\b': 'money fees',
    r'\bwala\b': 'the one with',
    r'\bkaise\b': 'how',
    r'\bhai\b': 'is',
    r'\bho\b': 'is',
    r'\bmein\b': 'in',
    r'\bka\b': 'of',
    r'\bki\b': 'of',
    r'\bke\b': 'of',
    r'\bse\b': 'from',
    r'\bko\b': 'to',
    r'\bpe\b': 'on',
    r'\bpar\b': 'on',

    # ── College-specific ─────────────────────────────────────────
    r'\battendance %\b': 'attendance percentage',
    r'\bkt\b': 'backlog subject',
    r'\bcgpa\b': 'CGPA cumulative grade point average',
    r'\bsgpa\b': 'SGPA semester grade point average',
    r'\bhod\b': 'Head of Department',
    r'\bplacement\b': 'placement cell campus recruitment',

    # ── Additional Gen Z slang ────────────────────────────────────
    r'\bhits different\b': 'feels uniquely special',
    r'\bperiod\b': 'that is final, end of discussion',
    r'\bits giving\b': 'it resembles, it looks like',
    r'\bcaught in 4k\b': 'caught red-handed with evidence',
    r'\bsending me\b': 'making me laugh uncontrollably',
    r'\bim dead\b': 'that is extremely funny',
    r'\brizz\b': 'charisma, charm',
    r'\bsalty\b': 'bitter or upset',
    r'\bghosting\b': 'suddenly stopping communication',
    r'\bspill the tea\b': 'share the gossip',
    r'\bdrag\b': 'to criticize harshly',
    r'\bglow up\b': 'a significant positive transformation',
    r'\bwoke\b': 'socially aware',
    r'\bcancelled\b': 'rejected or boycotted',
    r'\bsnack\b': 'an attractive person',
    r'\boof\b': 'expression of discomfort',
    r'\byolo\b': 'you only live once',
    r'\bgg\b': 'good game',
    r'\bistg\b': 'I swear to god',
    r'\bicl\b': "I can't lie",
    r'\bfr fr\b': 'for real for real',
    r'\bwya\b': 'where you at',
    r'\bttyl\b': 'talk to you later',
    r'\bily\b': 'I love you',
    r'\bftw\b': 'for the win',
    r'\brofl\b': 'rolling on the floor laughing',

    # ── Additional text abbreviations ─────────────────────────────
    r'\bkk\b': 'okay',
    r'\bomw\b': 'on my way',
    r'\bgtg\b': 'got to go',
    r'\b2day\b': 'today',
    r'\b2moro\b': 'tomorrow',
    r'\b2nite\b': 'tonight',
    r'\bgr8\b': 'great',
    r'\bm8\b': 'mate',
    r'\bl8r\b': 'later',
    r'\bcuz\b': 'because',
    r'\brly\b': 'really',
    r'\bprob\b': 'probably',
    r'\bdef\b': 'definitely',
    r'\bobv\b': 'obviously',
    r'\bperf\b': 'perfect',
    r'\bwhatev\b': 'whatever',
    r'\bsmth\b': 'something',
    r'\bsth\b': 'something',
    r'\bsb\b': 'somebody',
    r'\bbf\b': 'boyfriend',
    r'\bgf\b': 'girlfriend',

    # ── Additional Hindi / Hinglish terms ─────────────────────────
    r'\btheek hai\b': 'it is fine',
    r'\bsahi\b': 'correct, right',
    r'\bgalat\b': 'wrong',
    r'\bsamjha\b': 'understood',
    r'\bsamjhao\b': 'explain',
    r'\bbatao\b': 'tell me',
    r'\bdikha\b': 'show me',
    r'\bpadhna\b': 'to study',
    r'\bjaana\b': 'to go',
    r'\baana\b': 'to come',
    r'\bkarna\b': 'to do',
    r'\bmilega\b': 'will get',
    r'\bchahiye\b': 'need, want',
    r'\bkitne\b': 'how many',
    r'\bkyun\b': 'why',
    r'\bkidhar\b': 'where',
    r'\bkisko\b': 'to whom',
    r'\bsabse\b': 'the most',
    r'\bbohot\b': 'very much',
    r'\bbahut\b': 'very much',
    r'\bzyada\b': 'more, too much',
    r'\bkam\b': 'less',
    r'\bpehle\b': 'first, before',
    r'\bbaad\b': 'after',
    r'\babhi\b': 'now',
    r'\bkal\b': 'yesterday or tomorrow',
    r'\bparso\b': 'day before yesterday or day after tomorrow',
    r'\bjaldi\b': 'quickly',
    r'\bder\b': 'late, delay',
    r'\bmushkil\b': 'difficult',
    r'\baasan\b': 'easy',
    r'\bmast\b': 'great, awesome',
    r'\bzabardast\b': 'excellent, amazing',
    r'\bbakwas\b': 'nonsense',
    r'\bpagal\b': 'crazy',
    r'\bchillao mat\b': "don't shout",
    r'\bchill\b': 'relax',
    r'\bscene kya hai\b': 'what is the situation',
    r'\bkya scene hai\b': 'what is happening',
    r'\bragging\b': 'bullying or harassment of new students',
    r'\bbacklog\b': 'failed subject to be cleared later',
}


def _expand_slang(text: str) -> str:
    """Replace slang and abbreviations with full forms (case-insensitive)."""
    result = text
    for pattern, replacement in SLANG_MAP.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result


# Prompt that keeps answers grounded in the retrieved context
RAG_PROMPT = PromptTemplate(
    template=(
        "/no_think\n"
        "You are KRMAI, an AI assistant built for KR Mangalam University students.\n"
        "Maintain a strictly professional and polished tone by default. Avoid slang, "
        "excessive excitement, or overly casual language unless the user initiates that style first.\n\n"
        "CRITICAL LANGUAGE RULES (YOU MUST FOLLOW THESE WITHOUT EXCEPTION):\n"
        "- You MUST ALWAYS respond in English only. NEVER use Hindi, Hinglish, or any other language in your responses.\n"
        "- Even if the user asks in Hindi or Hinglish, you must understand their question but ALWAYS reply in English.\n"
        "- Do NOT include any Hindi/Hinglish words, phrases, or transliterations in your response.\n"
        "- Do NOT mix languages. Your entire response must be in clear, professional English.\n"
        "- This rule has NO exceptions. Even greetings, filler words, and expressions must be in English only.\n"
        "- If you catch yourself about to write a Hindi or Hinglish word, replace it with the English equivalent.\n"
        "- You can UNDERSTAND queries in Hindi (Devanagari script), Hinglish (Hindi written in English alphabet), and English, but you must ONLY OUTPUT English.\n\n"
        "Students may use informal language, slang, abbreviations, or shorthand.\n"
        "Interpret their intent naturally (e.g. 'uk' means 'you know', "
        "'idk' means 'I don't know', 'wanna' means 'want to').\n"
        "Use ONLY the context below to answer. Be clear, concise, and helpful.\n"
        "If the context does not contain the answer, say "
        "'I don't have enough information to answer that.'\n\n"
        "{chat_history}"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer (in English only):"
    ),
    input_variables=["context", "question", "chat_history"],
)


def _format_docs(docs):
    """Join retrieved document pages into a single context string."""
    return "\n\n".join(doc.page_content for doc in docs)


class RAGEngine:
    """Retrieval-Augmented Generation engine backed by ChromaDB + Ollama."""

    def __init__(self):
        self.vector_store = None
        self.retriever = None
        self.llm = None
        self.qa_chain = None
        self.chat_history = []  # Stores last N messages for conversational memory
        self.max_history = 6    # Keep last 6 messages (3 Q&A pairs)
        self.status = {"db": False, "ollama": False, "ready": False}
        self._initialize()

    # ── Setup ──────────────────────────────────────────────────
    def _initialize(self):
        # 1. Embeddings (runs locally via sentence-transformers)
        self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

        # 2. Vector store
        if os.path.exists(CHROMA_PATH) and os.listdir(CHROMA_PATH):
            try:
                self.vector_store = Chroma(
                    persist_directory=CHROMA_PATH,
                    embedding_function=self.embeddings,
                )
                self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
                self.status["db"] = True
            except Exception as e:
                print(f"[RAG] Error loading vector store: {e}")
        else:
            print("[RAG] ChromaDB not found — run ingest.py first.")

        # 3. Ollama LLM
        if self._ollama_is_running():
            try:
                self.llm = OllamaLLM(
                    model=LLM_MODEL,
                    base_url=OLLAMA_BASE_URL,
                    timeout=OLLAMA_TIMEOUT,
                    num_predict=512,  # limit output tokens for faster responses
                )
                self.status["ollama"] = True
                print(f"[RAG] Ollama connected: {LLM_MODEL}")
            except Exception as e:
                print(f"[RAG] Error initializing Ollama: {e}")
        else:
            print("[RAG] Ollama is not running. Start it with: ollama serve")

        # 4. RAG chain (using LCEL instead of deprecated RetrievalQA)
        if self.llm and self.retriever:
            self.qa_chain = (
                {
                    "context": self.retriever | _format_docs,
                    "question": RunnablePassthrough(),
                }
                | RAG_PROMPT
                | self.llm
                | StrOutputParser()
            )
            self.status["ready"] = True

    # ── Public API ─────────────────────────────────────────────
    def query(self, question: str, history: list = None):
        """Ask a question. Returns dict with answer + sources, or error string."""
        if not self.qa_chain:
            parts = []
            if not self.status["db"]:
                parts.append("Vector database not found — run 'python ingest.py' first.")
            if not self.status["ollama"]:
                parts.append("Ollama is not running — start it with 'ollama serve'.")
            return " | ".join(parts) if parts else "System not initialized."

        # Expand slang/abbreviations so retrieval finds the right docs
        cleaned_question = _expand_slang(question)

        # Build chat history string from provided history or internal buffer
        if history:
            self.chat_history = history[-self.max_history:]
        chat_history_str = ""
        if self.chat_history:
            chat_history_str = "Previous conversation:\n"
            for msg in self.chat_history:
                role = "Student" if msg["role"] == "user" else "Assistant"
                chat_history_str += f"{role}: {msg['content']}\n"
            chat_history_str += "\n"

        # Retrieve source documents separately for citations
        assert self.retriever is not None  # guaranteed when qa_chain is set
        source_docs = self.retriever.invoke(cleaned_question)

        # Build prompt inputs manually (can't use the chain directly with history)
        context = _format_docs(source_docs)
        prompt_text = RAG_PROMPT.format(
            context=context,
            question=cleaned_question,
            chat_history=chat_history_str,
        )
        answer = self.llm.invoke(prompt_text)

        # Update internal history
        self.chat_history.append({"role": "user", "content": question})
        self.chat_history.append({"role": "assistant", "content": answer})
        self.chat_history = self.chat_history[-self.max_history:]

        return {
            "answer": answer,
            "source_documents": source_docs,
        }

    # ── Helpers ────────────────────────────────────────────────
    @staticmethod
    def _ollama_is_running() -> bool:
        try:
            r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=10)
            if r.status_code == 200:
                models = r.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                if LLM_MODEL in model_names:
                    print(f"[RAG] Found model: {LLM_MODEL}")
                else:
                    print(f"[RAG] Warning: {LLM_MODEL} not found. Available: {model_names}")
                    print(f"[RAG] Pull it with: ollama pull {LLM_MODEL}")
                return True
            return False
        except Exception:
            return False
