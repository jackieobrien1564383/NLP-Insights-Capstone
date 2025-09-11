from functools import lru_cache
import spacy

@lru_cache(maxsize=1)
def get_nlp():
    # Load a lighter pipeline to save RAM on Render Free
    nlp = spacy.load("en_core_web_sm", exclude=["ner", "senter", "attribute_ruler"])
    # Prevent crashes if someone pastes a huge text blob
    nlp.max_length = 1_000_000
    return nlp
