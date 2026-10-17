
"""Compare an OpenAI summary with our existing NLTK baseline."""

from dotenv import load_dotenv
from openai import OpenAI

from backend.test_topic_summary import extract_topic
from backend.nltk_prototype import clean_text, create_summary
from pypdf import PdfReader


# Loads the textbook and extracts the selected lesson.
def load_lesson(pdf_path, heading):
    """Return the cleaned text for one textbook topic."""
    reader = PdfReader(pdf_path)

    raw_text = "\n".join(
        page.extract_text() or "" for page in reader.pages
    )

    cleaned_text = clean_text(raw_text)
    topic_text = extract_topic(cleaned_text, heading)

    if topic_text.startswith("Heading not found:"):
        raise ValueError(topic_text)

    return topic_text


# Generates a summary with OpenAI and reports actual token usage.
def main():
    load_dotenv()

    heading = "ZONATION OF MARINE HABITAT"
    topic_text = load_lesson("temp.pdf", heading)

    # Keep the local baseline for a fair comparison.
    local_summary = create_summary(topic_text, sentence_limit=5)

    client = OpenAI()

    response = client.responses.create(
        model="gpt-6-luna",
        instructions=(
    "You are an educational assistant. Summarize the supplied "
    "text for a secondary-school student. Preserve the textbook's "
    "important facts, terminology, distinctions, and all major "
    "categories. Use clear headings and concise bullet points. "
    "Do not introduce facts that are absent from the source. "
    "Do not treat related scientific terms as synonyms unless "
    "the source explicitly defines them that way. If a statement "
    "is unclear or potentially contradictory, preserve its meaning "
    "carefully rather than inventing a correction."
    ),
        input=topic_text,
        max_output_tokens=700,
    )

    llm_summary = response.output_text

    # Estimate the request cost using standard short-context pricing.
    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    input_cost = input_tokens * 0.10 / 1_000_000
    output_cost = output_tokens * 0.50 / 1_000_000
    total_cost = input_cost + output_cost

    print("=== SOURCE ===")
    print(f"Topic: {heading.title()}")
    print(f"Source words: {len(topic_text.split())}")
    print(f"Source characters: {len(topic_text)}")

    print("\n=== NLTK SUMMARY ===")
    print(local_summary)

    print("\n=== OPENAI SUMMARY ===")
    print(llm_summary)

    print("\n=== ACTUAL API USAGE ===")
    print(f"Model: {response.model}")
    print(f"Input tokens: {input_tokens}")
    print(f"Output tokens: {output_tokens}")
    print(f"Total tokens: {response.usage.total_tokens}")
    print(f"Estimated input cost: ${input_cost:.8f}")
    print(f"Estimated output cost: ${output_cost:.8f}")
    print(f"Estimated total cost: ${total_cost:.8f}")


if __name__ == "__main__":
    main()
