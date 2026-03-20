from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import restaurants, tables, reservations

app = FastAPI(
    title="Sistema de Reservas de Restaurantes",
    description="API para gerenciar restaurantes, mesas e reservas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(restaurants.router)
app.include_router(tables.router)
app.include_router(reservations.router)


@app.get("/")
def root():
    return {"message": "Sistema de Reservas de Restaurantes - API"}
