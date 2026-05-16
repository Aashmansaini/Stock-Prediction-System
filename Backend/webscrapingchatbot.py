
import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
import chromadb
import re
import unicodedata
import wordninja
from transformers import pipeline
import os

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"


# ------------------------------
# Constants
# ------------------------------
STOPWORDS = {
    'the','a','an','and','or','but','if','to','of','in','on','for','with',
    'is','be','are','was','were','by','as','at','from','that','this','it'
}
HEADERS = {"User-Agent": "Mozilla/5.0"}

# ------------------------------
# Scrape Wikipedia Page
# ------------------------------
def scrape_wikipedia_page(topic: str):
    topic_formatted = topic.strip().replace(" ", "_")
    url = f"https://en.wikipedia.org/wiki/{topic_formatted}"

    resp = requests.get(url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        raise RuntimeError(f"Failed to fetch page: status {resp.status_code}")

    soup = BeautifulSoup(resp.text, 'html.parser')
    content_div = soup.find('div', id='mw-content-text')
    if not content_div:
        raise RuntimeError("Could not find content section")

    paragraphs = content_div.find_all('p')
    original, cleaned = [], []

    for p in paragraphs:
        text = p.get_text(strip=True)
        if not text:
            continue

        text = unicodedata.normalize("NFKC", text)
        text = re.sub(r'\[\d+(?:[:–\d]*)?]|\[citation needed]', '', text, flags=re.I)
        text = re.sub(r'([.,;!?])(?=\w)', r'\1 ', text)

        words_split = []
        for word in text.split():
            words_split.extend(wordninja.split(word))
        text = " ".join(words_split)
        text = re.sub(r'\s+', ' ', text).strip()
        original.append(text)

        cleaned_text = re.sub(r'[^a-z0-9.,;!?\'" /\n]', ' ', text.lower())
        words = [w for w in cleaned_text.split() if w not in STOPWORDS]
        cleaned.append(" ".join(words))

    return original, cleaned

# ------------------------------
# Summarizer
# ------------------------------
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(text: str, query: str):
    if not text.strip():
        return "No content to summarize."

    # Dynamically set max/min length
    match = re.search(r'(\d+)\s*words?', query.lower())
    if match:
        desired_words = int(match.group(1))
        max_len = min(1024, desired_words * 2)
        min_len = max(50, int(max_len * 0.5))
    elif any(keyword in query.lower() for keyword in ["explain","essay", "long", "detailed", "paragraph"]):
        max_len = 512
        min_len = 150
    else:
        max_len = 200
        min_len = 60

    summary = summarizer(
        text,
        max_length=max_len,
        min_length=min_len,
        do_sample=False
    )[0]['summary_text']

    return summary

# ------------------------------
# Ask Bot
# ------------------------------
def ask_bot(query: str, model, collection):
    query_text = re.sub(r'[^a-z0-9.,;!?\'" /\n]', ' ', query.lower())
    query_words = [w for w in query_text.split() if w not in STOPWORDS]
    if not query_words:
        return "Query too generic or all stopwords."

    query_emb = model.encode([" ".join(query_words)], convert_to_numpy=True)[0]
    results = collection.query(query_embeddings=[query_emb.tolist()], n_results=5)
    full_text = "\n\n".join(results['documents'][0])
    return summarize_text(full_text, query)

# ------------------------------
# Main Loop with Multi-Topic Memory
# ------------------------------
if __name__ == "__main__":
    chroma_client = chromadb.Client()
    model = SentenceTransformer('all-MiniLM-L6-v2')

    topics_collections = {}  # topic_name -> chroma collection
    current_topic = None

    print("Type 'new topic' to add a new topic, 'switch topic' to change, 'list topics' to view, or 'exit' to quit.")

    while True:
        if not current_topic:
            cmd = input("No topic selected. Type 'new topic' to scrape one or 'exit': ").strip().lower()
            if cmd == 'exit':
                break
            if cmd == 'new topic':
                topic = input("Enter the Wikipedia topic you want to know about: ")
                original, cleaned = scrape_wikipedia_page(topic)
                print(f"Scraped {len(original)} paragraphs from Wikipedia")

                embeddings = model.encode(cleaned, convert_to_numpy=True)

                collection_name = f"wikipedia_{topic.replace(' ', '_')}"
                collection = chroma_client.create_collection(collection_name, get_or_create=True)
                for i, (para, emb) in enumerate(zip(original, embeddings)):
                    collection.add(documents=[para], embeddings=[emb.tolist()], ids=[str(i)])

                topics_collections[topic.lower()] = collection
                current_topic = topic.lower()
                print(f"Stored {len(original)} paragraphs in ChromaDB for topic '{topic}'")
            continue

        question = input(f"Ask your question about [{current_topic}] (or 'new topic'/'switch topic'/'list topics'/'exit'): ").strip()

        if question.lower() == 'exit':
            print("Goodbye!")
            break

        if question.lower() == 'new topic':
            topic = input("Enter the Wikipedia topic you want to know about: ")
            original, cleaned = scrape_wikipedia_page(topic)
            print(f"Scraped {len(original)} paragraphs from Wikipedia")

            embeddings = model.encode(cleaned, convert_to_numpy=True)

            collection_name = f"wikipedia_{topic.replace(' ', '_')}"
            collection = chroma_client.create_collection(collection_name, get_or_create=True)
            for i, (para, emb) in enumerate(zip(original, embeddings)):
                collection.add(documents=[para], embeddings=[emb.tolist()], ids=[str(i)])

            topics_collections[topic.lower()] = collection
            current_topic = topic.lower()
            print(f"Stored {len(original)} paragraphs in ChromaDB for topic '{topic}'")
            continue

        if question.lower() == 'list topics':
            print("Topics you have loaded so far:")
            for t in topics_collections:
                print("-", t)
            continue

        if question.lower() == 'switch topic':
            print("Available topics:")
            for t in topics_collections:
                print("-", t)
            topic_choice = input("Type the topic to switch to: ").lower()
            if topic_choice in topics_collections:
                current_topic = topic_choice
                print(f"Switched to topic: {current_topic}")
            else:
                print("Topic not found.")
            continue

        # Normal question about current topic
        collection = topics_collections[current_topic]
        print("\nBot reply:")
        print(ask_bot(question, model, collection))
        print("-" * 50)
