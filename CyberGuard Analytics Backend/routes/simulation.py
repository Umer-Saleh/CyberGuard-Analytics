from fastapi import APIRouter

from models.schemas import (
    SimulationInput
)

from services.markov_model import (
    compute_steady_state
)

from services.simulation import (
    run_markov_simulation
)

from services.analysis import (
    reliability_analysis
)

router = APIRouter()

# Labels aligned with the SPA mock data (`mockResults.states`) for drop-in JSON shape.
_STATE_LABELS = ("Safe", "Under Attack", "Compromised", "Recovery")


@router.post("/simulate")

def simulate(
    data: SimulationInput
):

    theoretical = compute_steady_state(

        data.lambda_rate,
        data.alpha,
        data.beta,
        data.gamma,
        data.delta

    )

    simulated = run_markov_simulation(

        data.lambda_rate,
        data.alpha,
        data.beta,
        data.gamma,
        data.delta,
        data.sim_time

    )

    rel = reliability_analysis(
        data.gamma,
        data.delta
    )

    states = [
        {
            "state": _STATE_LABELS[i],
            "theoretical": theoretical[i],
            "simulated": simulated[i],
        }
        for i in range(4)
    ]

    return {

        "theoretical": theoretical,

        "simulation": simulated,

        "states": states,

        "metrics": {
            "availability": rel["availability"],
            "mtbf": rel["mtbf"],
            "failureRate": rel["failure_rate"],
        },

    }
