
"""Experimental, local textbook-processing prototype for Avia Classroom."""

import re
from collections import Counter

from nltk.tokenize import PunktSentenceTokenizer, TreebankWordTokenizer
from pypdf import PdfReader


STOPWORDS = set("""
a an the and or but if then is are was were be been being
of to in on at by for from with as into about this that these
those it its they them their he she we you i has have had do does
did can could will would should may might not no yes than so
which what when where who why how page chapter section term
first second third fourth fifth sixth seventh eighth ninth tenth
introduction contents references reference figure table example
""".split())

sentence_tokenizer = PunktSentenceTokenizer()
word_tokenizer = TreebankWordTokenizer()

SECTION_HEADINGS = {
    "HORIZONTAL ZONATION",
    "VERTICAL ZONATION",
}

STOP_HEADINGS = {
    "EVALUATION",
    "GENERAL EVALUATION",
    "WEEKEND ASSIGNMENT",
    "READING ASSIGNMENT",
}


# Removes repeated PDF headers, page markers, and common front-matter noise.
def clean_text(text):
    """Clean extracted PDF text while preserving lesson content."""
    cleaned_lines = []
    inside_references = False

    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()

        if not line:
            continue

        # Skip repeated headers such as "1ST TERM/BIOLOGY/SS2 Page 1".
        if re.search(
            r"^\d+(?:ST|ND|RD|TH)\s+TERM/.*\bPAGE\s+\d+\s*$",
            line,
            re.IGNORECASE,
        ):
            continue

        # Skip standalone page numbers.
        if re.fullmatch(r"(?:page\s*)?\d+", line, re.IGNORECASE):
            continue

        # Skip the reference list until a likely new lesson heading appears.
        if line.upper() in {"REFERENCES", "REFERENCE", "BIBLIOGRAPHY"}:
            inside_references = True
            continue

        if inside_references:
            if re.match(
                r"^(?:CHAPTER\s+\d+|\d+(?:\.\d+)*\s+[A-Z])",
                line,
                re.IGNORECASE,
            ):
                inside_references = False
            else:
                continue

        # Ignore contents-list lines made mostly of dots and page numbers.
        if re.fullmatch(r"[\w\s,&()'-]+\.{2,}\s*\d*", line):
            continue

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


# Extracts useful words and ranks them by frequency.
def extract_keywords(text, limit=10):
    """Rank useful words by frequency, excluding common filler words."""
    words = [
        word.lower()
        for word in word_tokenizer.tokenize(text)
        if word.isalpha()
        and len(word) > 2
        and word.lower() not in STOPWORDS
    ]

    return Counter(words).most_common(max(0, limit))


# Splits textbook content using recognizable subsection headings.
def split_into_sections(text, headings):
    """Return the text grouped under each requested heading."""
    sections = {}
    current_heading = None
    current_lines = []

    for line in text.splitlines():
        cleaned_line = " ".join(line.split())
        normalized_line = cleaned_line.upper()

        if normalized_line in headings:
            if current_heading is not None:
                sections[current_heading] = "\n".join(current_lines).strip()

            current_heading = normalized_line
            current_lines = []

        elif current_heading is not None:
            # Stop collecting the current section at assessment headings.
            if normalized_line in STOP_HEADINGS:
                sections[current_heading] = "\n".join(current_lines).strip()
                current_heading = None
                current_lines = []
                continue

            current_lines.append(cleaned_line)

    if current_heading is not None:
        sections[current_heading] = "\n".join(current_lines).strip()

    return sections


# Groups wrapped lines into introductory text and numbered textbook items.
def parse_section_items(section_text):
    """Reconstruct numbered entries and stop at assessment sections."""
    intro_lines = []
    items = []
    current_item = []

    for raw_line in section_text.splitlines():
        line = " ".join(raw_line.split())

        if not line:
            continue

        # Stop before assessment or assignment content.
        if line.upper() in STOP_HEADINGS:
            break

        # Start a new numbered entry, preserving wrapped lines in each entry.
        if re.match(r"^\d+\.\s*", line):
            if current_item:
                items.append(" ".join(current_item))

            current_item = [re.sub(r"^\d+\.\s*", "", line)]

        elif current_item:
            current_item.append(line)

        else:
            intro_lines.append(line)

    if current_item:
        items.append(" ".join(current_item))

    return intro_lines, items


# Selects useful original sentences while skipping very short fragments.
def select_summary_sentences(text, limit=2):
    """Select original sentences without returning more than the requested limit."""
    if limit <= 0:
        return []

    sentences = sentence_tokenizer.tokenize(" ".join(text.split()))
    selected = []

    for sentence in sentences:
        sentence = sentence.strip()

        if len(sentence.split()) < 5:
            continue

        if sentence.upper() in STOP_HEADINGS:
            continue

        selected.append(sentence)

        if len(selected) >= limit:
            break

    return selected


# Creates a structured, section-aware summary from textbook content.
def create_summary(text, sentence_limit=4):
    """Build a section-aware outline that covers every numbered textbook entry."""
    sections = split_into_sections(text, SECTION_HEADINGS)

    if not sections:
        # Fall back to original sentences when recognized headings are absent.
        selected = select_summary_sentences(text, sentence_limit)
        return " ".join(selected) or "No suitable summary sentences found."

    summaries = []

    for heading, section_text in sections.items():
        intro_lines, items = parse_section_items(section_text)
        section_parts = []

        # Include one useful introductory sentence when available.
        if intro_lines:
            intro_text = " ".join(intro_lines)
            section_parts.extend(
                select_summary_sentences(intro_text, limit=1)
            )

        # Process every numbered entry so later zones are not silently omitted.
        for item in items:
            sentences = sentence_tokenizer.tokenize(" ".join(item.split()))
            sentences = [
                sentence.strip()
                for sentence in sentences
                if len(sentence.split()) >= 5
            ]

            if not sentences:
                continue

            # Keep the first sentence from this numbered entry.
            section_parts.append(sentences[0])

            # Include a supporting sentence when the entry contains one.
            if len(sentences) > 1:
                second_sentence = sentences[1]

                # Avoid repeating the exact same sentence.
                if second_sentence.lower() != sentences[0].lower():
                    section_parts.append(second_sentence)

        if section_parts:
            formatted_items = "\n".join(
                f"- {part}" for part in section_parts
            )
            summaries.append(f"{heading.title()}:\n{formatted_items}")

    return "\n\n".join(summaries) or "No suitable summary sentences found."


# Finds likely definition sentences without including section headings.
def find_definition_candidates(text, limit=5):
    """Find distinct original sentences that may define a concept."""
    if limit <= 0:
        return []

    candidates = []
    seen = set()

    definition_phrases = (
        " is ",
        " are ",
        " means ",
        " refers to ",
        " is called ",
        " are called ",
        " is known as ",
        " are known as ",
        " can be defined as ",
    )

    for raw_line in text.splitlines():
        line = " ".join(raw_line.split())

        if not line or line.isupper():
            continue

        # Remove numbering before checking the sentence.
        line = re.sub(r"^\d+\.\s*", "", line)

        for sentence in sentence_tokenizer.tokenize(line):
            sentence = sentence.strip()
            normalized = sentence.lower()

            if normalized in seen:
                continue

            if not 6 <= len(sentence.split()) <= 45:
                continue

            if any(
                phrase in f" {normalized} "
                for phrase in definition_phrases
            ):
                candidates.append(sentence)
                seen.add(normalized)

                if len(candidates) >= limit:
                    return candidates

    return candidates


# Reads a PDF and returns its cleaned text and basic metadata.
def extract_pdf_text(pdf_path):
    """Extract readable text from a PDF file."""
    reader = PdfReader(pdf_path)
    raw_text = "\n".join(
        page.extract_text() or "" for page in reader.pages
    )

    return clean_text(raw_text), len(reader.pages), len(raw_text)


# Runs a small sample test when this file is executed directly.
def main():
    sample_text = """
    HORIZONTAL ZONATION
    The marine habitat is made up of the sea shore and open sea.
    1. Supratidal or splash zone is exposed to occasional moisture.
    2. Intertidal zone is exposed at low tide and covered at high tide.
    VERTICAL ZONATION
    Based on light penetration, the marine habitat has three zones.
    1. Euphotic zone receives enough light for photosynthesis.
    2. Disphotic zone receives dim light.
    """

    sample_text = clean_text(sample_text)

    print("\n=== KEYWORDS ===")
    for word, count in extract_keywords(sample_text):
        print(f"{word}: {count}")

    print("\n=== SECTION-AWARE SUMMARY ===")
    print(create_summary(sample_text, sentence_limit=4))

    print("\n=== POSSIBLE FLASHCARD CONTENT ===")
    for sentence in find_definition_candidates(sample_text):
        print("Front: What concept is described here?")
        print(f"Back: {sentence}\n")


if __name__ == "__main__":
    main()
