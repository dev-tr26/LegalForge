from langchain.llms.base import LLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from typing import Optional, List, Any
import requests
import logging
import json
from django.conf import settings
from pydantic import Field

logger = logging.getLogger(__name__)


class FreeLLM(LLM):
    """Fallback mock LLM"""

    class Config:
        arbitrary_types_allowed = True

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        if "extract key information" in prompt.lower() or "analyze this legal document" in prompt.lower():
            return json.dumps({
                "parties": ["First Party (Disclosing Party)", "Second Party (Receiving Party)"],
                "dates": ["Effective Date: To be specified"],
                "clauses": ["Confidentiality Obligations", "Term and Termination", "Governing Law"],
                "document_type": "Legal Document"
            })

        # Generate mock document
        return """
NON-DISCLOSURE AGREEMENT

This Agreement is entered into as of [DATE], by and between:

PARTY A: [Name and Address]
PARTY B: [Name and Address]

1. CONFIDENTIAL INFORMATION
   The parties agree to protect confidential information shared between them.

2. OBLIGATIONS
   - Maintain confidentiality
   - Use information only for authorized purposes
   - Not disclose to third parties

3. TERM
   This Agreement remains in effect for [DURATION].

4. GOVERNING LAW
   Governed by the laws of [JURISDICTION].

SIGNATURES:
_____________________    _____________________
Party A                  Party B
Date: ______________    Date: ______________

[Note: This is a mock template. Configure Groq API for AI-generated content.]
        """

    @property
    def _llm_type(self) -> str:
        return "mock_llm"


class GroqLLM(LLM):
    """Groq LLM using OpenAI-compatible API"""

    api_key: str = Field(default="")
    api_url: str = Field(default="")
    model: str = Field(default="")

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.api_key = getattr(settings, "LLM_API_KEY", "")
        self.api_url = getattr(settings, "LLM_API_URL", "")
        self.model = getattr(settings, "LLM_MODEL")

        if not self.api_key or not self.api_url:
            logger.warning("Groq API not configured. Will use mock responses.")
        else:
            logger.info(f"Groq API configured with model: {self.model}")

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        # Check if API is configured
        if not self.api_key or not self.api_url:
            logger.info("Using mock response (API not configured)")
            return FreeLLM()._call(prompt)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 2000
        }
    
        try:
            logger.info(f"Calling Groq API: {self.api_url}")
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()["choices"][0]["message"]["content"]
            logger.info("Groq API call successful")
            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"Groq API error: {str(e)}")
            if hasattr(e, "response") and e.response is not None:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response text: {e.response.text}")
            logger.warning("Falling back to mock response")
            return FreeLLM()._call(prompt)

    @property
    def _llm_type(self) -> str:
        return "groq_llm"


class LLMService:
    def __init__(self):
        # Check if API is configured
        api_key = getattr(settings, "LLM_API_KEY", "")
        if api_key and api_key not in ["", "your-api-key", "test"]:
            logger.info("Initializing GroqLLM")
            self.llm = GroqLLM()
        else:
            logger.info("Initializing FreeLLM (mock mode)")
            self.llm = FreeLLM()

    def extract_structured_data(self, ocr_text: str) -> str:
        """Extract structured data from OCR text"""
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""
Analyze this legal document and extract key information.

Document text:
{text}

Extract and return ONLY a JSON object with this structure:
{{
  "parties": ["list of party names"],
  "dates": ["list of important dates"],
  "clauses": ["list of key clauses/terms"],
  "document_type": "type of document (NDA, Contract, Lease, etc.)"
}}

Return ONLY the JSON, no other text.
"""
        )

        try:
            chain = LLMChain(llm=self.llm, prompt=prompt)
            result = chain.invoke({"text": ocr_text[:3000]})
            
            # Extract text from result
            if isinstance(result, dict):
                text_result = result.get("text", "")
            else:
                text_result = str(result)
            
            # Try to parse as JSON
            try:
                # Remove markdown code blocks if present
                text_result = text_result.replace("```json", "").replace("```", "").strip()
                json.loads(text_result)  # Validate JSON
                return text_result
            except json.JSONDecodeError:
                logger.warning("LLM did not return valid JSON, using default")
                return json.dumps({
                    "parties": ["Party A", "Party B"],
                    "dates": ["Date not specified"],
                    "clauses": ["Terms and Conditions"],
                    "document_type": "Legal Document"
                })
          
        except Exception as e:
            logger.error(f"Extraction error: {str(e)}")
            return json.dumps({
                "parties": [],
                "dates": [],
                "clauses": [],
                "document_type": "Unknown"
            })

    def generate_document(self, template_type: str, structured_data: str, user_prompt: str) -> str:
        """Generate legal document from template and data"""
        prompt = PromptTemplate(
            input_variables=["template_type", "data", "instructions"],
            template="""
Generate a professional {template_type} legal document.

Use this extracted data:
{data}

Additional instructions: {instructions}

Create a complete, legally-sound document with:
- Proper legal formatting
- Clear section headers
- Party information
- Terms and conditions
- Signature blocks

Make it professional and ready to use.
"""
        )

        try:
            chain = LLMChain(llm=self.llm, prompt=prompt)
            result = chain.invoke({
                "template_type": template_type,
                "data": structured_data,
                "instructions": user_prompt or "Standard format"
            })
            
            # Extract text from result
            if isinstance(result, dict):
                return result.get("text", str(result))
            return str(result)

        except Exception as e:
            logger.error(f"Generation error: {str(e)}")
            return f"""
{template_type.upper()}

[Generated from uploaded document]

Date: [To be specified]

PARTIES:
[Based on uploaded content]

TERMS AND CONDITIONS:
[Extracted from document]

SIGNATURES:
_____________________    _____________________

[Note: Configure Groq API for AI-customized content]
"""