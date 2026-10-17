
"""Compare the local NLTK summary with a future LLM summary."""

from pypdf import PdfReader

from backend.nltk_prototype import clean_text, create_summary
from backend.test_topic_summary import extract_topic


# Extracts the selected lesson from the existing textbook PDF.
def load_lesson(pdf_path, heading):
    """Return the cleaned text for one selected textbook topic."""
    reader = PdfReader(pdf_path)

    raw_text = "\n".join(
        page.extract_text() or "" for page in reader.pages
    )

    cleaned_text = clean_text(raw_text)
    topic_text = extract_topic(cleaned_text, heading)

    if topic_text.startswith("Heading not found:"):
        raise ValueError(topic_text)

    return topic_text


# Runs the local baseline and reports the amount of source text.
def main():
    heading = "ZONATION OF MARINE HABITAT"
    topic_text = load_lesson("temp.pdf", heading)

    local_summary = create_summary(topic_text, sentence_limit=5)

    print("=== COMPARISON TEST: LOCAL BASELINE ===")
    print(f"Topic: {heading.title()}")
    print(f"Source characters: {len(topic_text)}")
    print(f"Source words: {len(topic_text.split())}")
    print(f"Approximate input tokens: {len(topic_text.split()) * 1.3:.0f}")

    print("\n=== NLTK SUMMARY ===")
    print(local_summary)

    print("\n=== NEXT EXPERIMENT ===")
    print("Use the same source text for the LLM summary.")
    print("Compare accuracy, coverage, readability and cost.")


if __name__ == "__main__":
    main()
