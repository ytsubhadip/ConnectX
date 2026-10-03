import os
from dotenv import load_dotenv
from groq import Groq
from google import genai


load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROCK_API_KEY")
)


# Initialize gemini client
gemini_client = genai.Client(
    api_key = os.getenv("GEMINI_API_KEY")
)


def groq_api(query:str):

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
                {
                    "role": "user",
                    "content": f"{query}"
                }
            ],
            max_tokens=500
        )

        
    llm_response = (response.choices[0].message.content)

    return llm_response


def gemini_api(query:str):
        response = gemini_client.models.generate_content(
              model="gemini-3.8-flash",
              contents=query
        )

        llm_response = response.text
        return llm_response