def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150):
    chunks = []
    start = 0

    text = text.strip()

    if not text:
        return chunks

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks