from openai import OpenAI
from app.config import settings
from app.services.search_service import semantic_search

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def build_context(search_results):
    context_blocks = []

    for chunk, distance in search_results:
        context_blocks.append(
            f"""
Source:
Document ID: {chunk.document_id}
Chunk ID: {chunk.id}
Page: {chunk.page_number}

Content:
{chunk.chunk_text}
"""
        )

    return "\n\n".join(context_blocks)

def generate_answer(db, question: str, user_id: int, language: str = "English"):
    search_results = semantic_search(db, question, user_id=user_id, limit=5)

    context = build_context(search_results)

    prompt = f"""
You are an enterprise knowledge assistant.

Answer the user's question using only the document context provided.

Rules:
- Do not make up information.
- Answer in {language}.
- If the answer is not in the context, say the equivalent of "I could not find that in the uploaded documents." in {language}.
- Keep the answer clear and professional.
- Mention the source document ID and page number when possible.

Context:
{context}

User question:
{question}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You answer questions using only the provided enterprise document context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    answer = response.choices[0].message.content

    sources = [
        {
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "page_number": chunk.page_number,
            "distance": float(distance)
        }
        for chunk, distance in search_results
    ]

    return {
        "answer": answer,
        "sources": sources
    }
