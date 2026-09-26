def create_chunks_from_pages(
    pages,
    chunk_size=1000,
    overlap=200
):
    all_chunks = []

    for page in pages:

        page_number = page["page"]
        page_text = page["text"]

        words = page_text.split()

        current_chunk = []
        current_length = 0

        for word in words:

            word_length = len(word) + 1

            if current_length + word_length > chunk_size:

                chunk_text = " ".join(current_chunk).strip()

                if chunk_text:
                    all_chunks.append({
                        "text": chunk_text,
                        "page": page_number
                    })

                # Keep overlap words
                overlap_words = []
                overlap_length = 0

                for previous_word in reversed(current_chunk):

                    word_len = len(previous_word) + 1

                    if overlap_length + word_len > overlap:
                        break

                    overlap_words.insert(0, previous_word)
                    overlap_length += word_len

                current_chunk = overlap_words

                current_length = overlap_length

            current_chunk.append(word)
            current_length += word_length

        # Add remaining words from this page
        if current_chunk:

            chunk_text = " ".join(current_chunk).strip()

            if chunk_text:
                all_chunks.append({
                    "text": chunk_text,
                    "page": page_number
                })

    return all_chunks