# PopChoice - RAG Implementation Architecture

## What is RAG?

**RAG (Retrieval-Augmented Generation)** is an AI pattern that combines:
1. **Retrieval**: Finding relevant information from a knowledge base
2. **Augmentation**: Adding retrieved context to a prompt
3. **Generation**: Using an LLM to generate responses with that context

## Why PopChoice is a RAG Application

PopChoice implements RAG by:
1. ✅ **Storing movie data as vector embeddings** (knowledge base)
2. ✅ **Retrieving similar movies** based on semantic search (retrieval)
3. ✅ **Generating AI explanations** using retrieved movie context (augmented generation)

---

## RAG Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         POPCHOICE RAG SYSTEM                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  1. DATA INGESTION  │ (One-time setup via load_movies.py)
└─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  movies.json                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ {                                              │    │
│  │   "title": "Inception",                        │    │
│  │   "description": "A skilled thief enters..."   │    │
│  │   "genre": "Sci-Fi, Thriller",                 │    │
│  │   "year": 2010                                 │    │
│  │ }                                              │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  EMBEDDING GENERATION (embedding.py)                    │
│  ┌────────────────────────────────────────────────┐    │
│  │  OpenAI text-embedding-ada-002                 │    │
│  │  Input: "A skilled thief enters people's..."   │    │
│  │  Output: [0.123, -0.456, 0.789, ..., 0.321]   │    │
│  │          (1536-dimensional vector)             │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  VECTOR DATABASE (Supabase + pgvector)                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  movies table:                                 │    │
│  │  - id                                          │    │
│  │  - title                                       │    │
│  │  - genre                                       │    │
│  │  - description                                 │    │
│  │  - year                                        │    │
│  │  - embedding (vector 1536)  ← STORED HERE     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

┌─────────────────────┐
│  2. USER QUERY      │ (Runtime - /recommend endpoint)
└─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: User types query                             │
│  "I want action movies with mind-bending plots"         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  QUERY EMBEDDING (services.py → embedding.py)           │
│  ┌────────────────────────────────────────────────┐    │
│  │  OpenAI text-embedding-ada-002                 │    │
│  │  Input: "action movies with mind-bending..."   │    │
│  │  Output: [0.111, -0.222, 0.333, ..., 0.444]   │    │
│  │          (1536-dimensional vector)             │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  VECTOR SIMILARITY SEARCH (Retrieval)                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  Supabase RPC: match_movies()                  │    │
│  │  - Cosine similarity between vectors           │    │
│  │  - match_threshold: 0.5                        │    │
│  │  - match_count: 3 (top 3 results)              │    │
│  │                                                 │    │
│  │  Returns:                                      │    │
│  │  1. Inception (similarity: 0.92)               │    │
│  │  2. The Matrix (similarity: 0.88)              │    │
│  │  3. The Dark Knight (similarity: 0.85)         │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  RETURN RETRIEVED MOVIES                                │
│  Frontend displays top 3 matching movies                │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

┌─────────────────────┐
│  3. EXPLANATION     │ (Runtime - /explain endpoint)
└─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  User clicks "Why this movie?" on "Inception"           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  AUGMENTED GENERATION (services.py)                     │
│  ┌────────────────────────────────────────────────┐    │
│  │  Prompt to GPT-4o-mini:                        │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │ User preference: "action movies with     │  │    │
│  │  │                   mind-bending plots"    │  │    │
│  │  │ Recommended movie: "Inception"           │  │    │
│  │  │ Explain why this matches...              │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  │                                                 │    │
│  │  LLM Response:                                 │    │
│  │  "Inception perfectly matches your request    │    │
│  │   combining intense action sequences with a   │    │
│  │   complex, mind-bending plot about dream      │    │
│  │   infiltration..."                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Display AI-generated explanation to user               │
└─────────────────────────────────────────────────────────┘
```

---

## Detailed Component Breakdown

### 📦 **1. Data Preparation Layer**

**File**: `load_movies.py`

```python
# Read movie data
movies = json.load("movies.json")

# For each movie:
for movie in movies:
    # Convert description to embedding
    embedding = create_embedding(movie["description"])
    
    # Store in vector database
    supabase.table("movies").insert({
        "title": movie["title"],
        "embedding": embedding  # 1536-dim vector
    })
```

**What happens**:
- Movie descriptions → OpenAI Embedding API → Vector representations
- Vectors capture semantic meaning (not just keywords)
- Stored in Supabase with pgvector extension

---

### 🔍 **2. Retrieval Layer** (The "R" in RAG)

**File**: `services.py` → `search_movies()`

```python
def search_movies(query: str):
    # 1. Convert user query to embedding
    query_embedding = create_embedding(query)
    
    # 2. Find similar movies using vector search
    result = supabase.rpc("match_movies", {
        "query_embedding": query_embedding,
        "match_threshold": 0.5,
        "match_count": 3
    })
    
    return result.data
```

**Vector Similarity Search**:
- Compares query embedding with all movie embeddings
- Uses **cosine similarity** to find closest matches
- Returns top 3 most semantically similar movies

**Example**:
```
Query: "romantic comedy with time travel"
→ Embedding: [0.1, 0.5, -0.3, ...]

Database Search:
- About Time (similarity: 0.94) ✅
- Groundhog Day (similarity: 0.89) ✅
- The Time Traveler's Wife (similarity: 0.87) ✅
```

---

### 🤖 **3. Generation Layer** (The "G" in RAG)

**File**: `services.py` → `explain_movie()`

```python
def explain_movie(query, movie):
    # Augmented prompt with retrieved context
    prompt = f"""
        User preference: {query}
        Recommended movie: {movie}
        Explain why this matches...
    """
    
    # Generate response using LLM
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
```

**Why this is "Augmented"**:
- Without RAG: LLM would guess based on general knowledge
- With RAG: LLM uses **specific retrieved movie** + **user's actual query**
- More accurate, contextual, and personalized explanations

---

## Why This is a RAG Application

### ✅ **Retrieval Component**
- Vector embeddings of movie descriptions
- Semantic similarity search (not keyword matching)
- Retrieves relevant movies from knowledge base

### ✅ **Augmentation Component**
- Retrieved movie title + User's original query
- Combines structured data with natural language
- Provides context to LLM

### ✅ **Generation Component**
- Uses GPT-4o-mini to generate explanations
- Grounded in retrieved data (not hallucinated)
- Personalized to user's preferences

---

## RAG vs Traditional Search

| Traditional Keyword Search | RAG-Based Search (PopChoice) |
|----------------------------|------------------------------|
| Matches exact words | Understands meaning |
| "action" finds only "action" | "thrilling adventure" finds action movies |
| No context awareness | Semantic understanding |
| Static results | Personalized explanations |
| Can't explain "why" | AI explains relevance |

**Example**:
```
Query: "Movies about dreams and reality"

Keyword Search:
- Only finds movies with "dreams" in description
- Misses "Inception" if description doesn't say "dreams"

RAG Search:
- Understands semantic concept
- Finds Inception, The Matrix, etc.
- Explains: "explores blurred lines between consciousness..."
```

---

## Tech Stack Summary

```
┌─────────────────────────────────────────────────┐
│             FRONTEND (React)                    │
│  - Search interface                             │
│  - Display recommendations                      │
│  - Show AI explanations                         │
└─────────────────────────────────────────────────┘
                      ▲ │
                      │ ▼
┌─────────────────────────────────────────────────┐
│             BACKEND (FastAPI)                   │
│  - /recommend → Vector search                   │
│  - /explain → AI generation                     │
└─────────────────────────────────────────────────┘
                      ▲ │
                      │ ▼
┌─────────────────────────────────────────────────┐
│          VECTOR DATABASE (Supabase)             │
│  - PostgreSQL + pgvector                        │
│  - Stores movie embeddings                      │
│  - Cosine similarity search                     │
└─────────────────────────────────────────────────┘
                      ▲ │
                      │ ▼
┌─────────────────────────────────────────────────┐
│             AI SERVICES (OpenAI)                │
│  - text-embedding-ada-002 (embeddings)          │
│  - gpt-4o-mini (explanations)                   │
└─────────────────────────────────────────────────┘
```

---

## Key Benefits of RAG Approach

1. **🎯 Semantic Understanding**: Finds movies by meaning, not keywords
2. **📊 Scalable**: Add thousands of movies without retraining
3. **🔄 Fresh Data**: Update movie database anytime
4. **💡 Explainable**: AI explains why movies match
5. **🎨 Personalized**: Responses tailored to user's query

---

## Summary

PopChoice is a **RAG application** because it:

1. **Retrieves** relevant movies using vector similarity search
2. **Augments** LLM prompts with retrieved movie data + user queries  
3. **Generates** personalized explanations using GPT-4o-mini

This creates an intelligent movie recommendation system that understands user intent and provides contextual, accurate recommendations backed by AI explanations.
