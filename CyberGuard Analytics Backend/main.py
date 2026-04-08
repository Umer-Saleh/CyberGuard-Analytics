from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.simulation import router as simulation_router
from routes.analysis import router as analysis_router


app = FastAPI(
    title="Cybersecurity IDS Stochastic API"
)


# Wildcard origin is incompatible with credentials in browsers; keep credentials off for "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    simulation_router
)

app.include_router(
    analysis_router
)


@app.get("/health")

def health_check():

    return {

        "status": "running"

    }
