from pydantic import BaseModel

class MovieQuery(BaseModel):
  query: str


class MovieExplanation(BaseModel):
  query: str
  movie: str