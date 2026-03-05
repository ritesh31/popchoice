import json
from embedding import create_embedding
from database import supabase

with open("./datasets/movies.json") as file:
    movies = json.load(file)

for movie in movies:

    text = movie["description"]

    embedding = create_embedding(text)

    supabase.table("movies").insert({
      "title": movie["title"],
      "genre": movie["genre"],
      "description": movie["description"],
      "year": movie["year"],
      "embedding": embedding
    }).execute()

    print("Inserted:", movie["title"])