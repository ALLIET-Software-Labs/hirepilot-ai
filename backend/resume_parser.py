"""
Resume parser supporting PDF, DOCX, and TXT files.
Extracts clean plain text and detected contact metadata.
"""

import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader
from docx import Document


def extract_contact_info(text: str) -> Dict[str, Any]:
    """Heuristically extract email, phone, and professional links from resume text."""
    # Email regex
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email = email_match.group(0) if email_match else ""

    # Phone regex (international & US formats)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0).strip() if phone_match else ""

    # Professional profiles
    links: List[str] = []
    github_match = re.findall(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    linkedin_match = re.findall(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    portfolio_match = re.findall(r'https?:\/\/[a-zA-Z0-9_.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?', text)

    all_links = set(github_match + linkedin_match + portfolio_match)
    links = list(all_links)[:5]

    # Candidate Name heuristic: first non-empty line with 2-4 words, no digits
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    detected_name = ""
    for line in lines[:5]:
        words = line.split()
        if 1 <= len(words) <= 4 and not re.search(r'\d', line) and '@' not in line and not line.lower().startswith(('resume', 'curriculum', 'page', 'http')):
            detected_name = line
            break

    return {
        "email": email,
        "phone": phone,
        "links": links,
        "detected_name": detected_name
    }


def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise ValueError("The uploaded PDF is password-protected and cannot be parsed.")
        
        extracted_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_text.append(page_text.strip())

        full_text = "\n\n".join(extracted_text).strip()
        if not full_text:
            raise ValueError("The PDF contains no selectable text. It may be a scanned image.")
        return full_text
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to parse PDF document: {str(e)}")


def parse_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file, including tables and paragraphs."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        
        # Also extract table text (often used in resume layouts)
        for table in doc.tables:
            for row in table.rows:
                row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_texts:
                    paragraphs.append(" | ".join(row_texts))

        full_text = "\n\n".join(paragraphs).strip()
        if not full_text:
            raise ValueError("The Word document is empty.")
        return full_text
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to parse DOCX document: {str(e)}")


def parse_txt(file_bytes: bytes) -> str:
    """Extract text from a plain text file."""
    for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
        try:
            text = file_bytes.decode(encoding).strip()
            if text:
                return text
        except UnicodeDecodeError:
            continue
    raise ValueError("Could not decode text file using standard character encodings.")


def parse_resume_file(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """Parse resume file by extension and return text with metadata."""
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.pdf'):
        text = parse_pdf(file_bytes)
    elif filename_lower.endswith(('.docx', '.doc')):
        text = parse_docx(file_bytes)
    elif filename_lower.endswith(('.txt', '.text', '.md')):
        text = parse_txt(file_bytes)
    else:
        raise ValueError("Unsupported file format. Please upload a PDF, DOCX, or TXT file.")

    # Clean redundant whitespace
    cleaned_text = re.sub(r'[ \t]+', ' ', text)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

    contact = extract_contact_info(cleaned_text)
    words = cleaned_text.split()

    return {
        "text": cleaned_text,
        "filename": filename,
        "word_count": len(words),
        "detected_name": contact["detected_name"],
        "email": contact["email"],
        "phone": contact["phone"],
        "links": contact["links"]
    }
