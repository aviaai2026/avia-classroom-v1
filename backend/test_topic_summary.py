
import re
from pypdf import PdfReader
from backend.nltk_prototype import clean_text, extract_keywords


# Finds recognizable topic headings in the extracted textbook text.
def find_heading_positions(lines, heading):
    target = re.sub(r"\s+", " ", heading).strip().upper()
    positions = []

    for index, line in enumerate(lines):
        normalized = re.sub(r"\s+", " ", line).strip().upper()

        if normalized == target:
            positions.append(index)

    return positions


# Extracts text between a topic heading and the next major heading.
def extract_topic(text, heading):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    positions = find_heading_positions(lines, heading)

    if not positions:
        return f"Heading not found: {heading}"

    start = positions[0] + 1

    major_headings = {
        "ESTUARINE HABITATS (BRACKISH WATER HABITATS)",
        "FRESH WATER HABITATS",
        "TERRESTRIAL HABITATS",
        "GENERAL EVALUATION",
        "WEEKEND ASSIGNMENT",
        "WEEK TWO",
        "DISTRIBUTION OF ORGANISMS AND ADAPTATION TO MARINE HABITAT",
    }

    end = len(lines)

    for index in range(start, len(lines)):
        if lines[index].upper() in major_headings:
            end = index
            break

    return "\n".join(lines[start:end])


def main():
    reader = PdfReader("temp.pdf")
    raw_text = "\n".join(page.extract_text() or "" for page in reader.pages)
    text = clean_text(raw_text)

    topic = extract_topic(text, "ZONATION OF MARINE HABITAT")

    print("=== TOPIC ===")
    print("Zonation of Marine Habitat")

    
    print("\n=== EXTRACTED TOPIC PREVIEW ===")
    print(topic[:5000])

    print("\n=== TOPIC SUMMARY ===")
    from backend.nltk_prototype import create_summary
    print(create_summary(topic, sentence_limit=5))


    print("\n=== TOPIC KEYWORDS ===")
    print(extract_keywords(topic, limit=10))


if __name__ == "__main__":
    main()
