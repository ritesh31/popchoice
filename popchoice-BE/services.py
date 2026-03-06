from embedding import create_embedding
from database import supabase
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def search_movies(query: str):
  query_embedding = create_embedding(query)

  result = supabase.rpc(
    "match_movies",
    {
        "query_embedding": query_embedding,
        "match_threshold": 0.5,
        "match_count": 3
    }
  ).execute()

  return result.data

def explain_movie(query, movie):
  prompt = f"""
    User preference: {query}
    Recommended movie: {movie}
    Explain why this movie matches the user's preference.
  """

  response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {"role": "user", "content": prompt}
    ]
  )

  return response.choices[0].message.content