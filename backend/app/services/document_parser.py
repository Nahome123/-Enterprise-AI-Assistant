import base64
import mimetypes

from openai import OpenAI
from pypdf import PdfReader
from docx import Document as DocxDocument

from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

IMAGE_FILE_TYPES = {"png", "jpg", "jpeg", "webp", "tif", "tiff"}


def extract_text_from_pdf(file_path: str):
    reader = PdfReader(file_path)
    pages = []

    for index, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({
            "page_number": index + 1,
            "text": text
        })

    return pages

def extract_text_from_txt(file_path: str):
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()

    return [
        {
            "page_number": None,
            "text": text
        }
    ]

def extract_text_from_docx(file_path: str):
    doc = DocxDocument(file_path)

    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])

    return [
        {
            "page_number": None,
            "text": text
        }
    ]


def extract_text_from_image(file_path: str):
    mime_type = mimetypes.guess_type(file_path)[0] or "image/jpeg"

    with open(file_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

    response = client.chat.completions.create(
        model=settings.IMAGE_OCR_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract readable text from enterprise document images. "
                    "Return only the extracted text, preserving headings, tables, labels, and line breaks where useful. "
                    "If no readable text is present, return an empty string."
                ),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Extract all readable text from this uploaded image for document search.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{encoded_image}",
                            "detail": "high",
                        },
                    },
                ],
            },
        ],
        temperature=0,
    )

    text = (response.choices[0].message.content or "").strip()

    if not text:
        raise ValueError("No readable text found in image")

    return [
        {
            "page_number": None,
            "text": text,
        }
    ]


def extract_text(file_path: str, file_type: str):
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)

    if file_type == "txt":
        return extract_text_from_txt(file_path)

    if file_type == "docx":
        return extract_text_from_docx(file_path)

    if file_type in IMAGE_FILE_TYPES:
        return extract_text_from_image(file_path)

    raise ValueError("Unsupported file type")
