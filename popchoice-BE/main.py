from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import MovieQuery, MovieExplanation
from services import search_movies, explain_movie

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
  return {"message": "PopChoice API running 🚀"}


# Movie Recommendation
@app.post("/recommend")
def recommend_movie(data: MovieQuery):

  movies = search_movies(data.query)

  return {
    "query": data.query,
    "movies": movies
  }

# Explain Movie Recommendation
@app.post("/explain")
def explain(data: MovieExplanation):

  explanation = explain_movie(data.query, data.movie)

  return {
    "movie": data.movie,
    "explanation": explanation
  }