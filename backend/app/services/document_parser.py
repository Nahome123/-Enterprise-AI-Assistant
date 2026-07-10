from pypdf import PdfReader
from docx import Document as DocxDocument

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

def extract_text(file_path: str, file_type: str):
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)

    if file_type == "txt":
        return extract_text_from_txt(file_path)

    if file_type == "docx":
        return extract_text_from_docx(file_path)

    raise ValueError("Unsupported file type")