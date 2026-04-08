from fastapi import APIRouter

from models.schemas import (
    SensitivityInput,
    MonteCarloInput,
    ReliabilityInput,
)

from services.analysis import (
    monte_carlo_analysis,
    sensitivity_analysis,
    reliability_analysis
)

from config import SIMULATION_RUNS

router = APIRouter()


@router.post("/montecarlo")
def monte_carlo(
    data: MonteCarloInput,
):
    params = [
        data.lambda_rate,
        data.alpha,
        data.beta,
        data.gamma,
        data.delta,
        data.sim_time,
    ]

    results = monte_carlo_analysis(
        SIMULATION_RUNS,
        params
    )

    return {
        "runs": SIMULATION_RUNS,
        "results": results
    }


@router.post("/sensitivity")
def sensitivity(
    data: SensitivityInput,
):
    lambdas, results = sensitivity_analysis(
        data.lambda_start,
        data.lambda_end,
        data.steps,
        data.alpha,
        data.beta,
        data.gamma,
        data.delta
    )

    return {
        "lambdas": lambdas,
        "results": results
    }


@router.post("/reliability")
def reliability(
    data: ReliabilityInput,
):
    return reliability_analysis(
        gamma=data.gamma,
        delta=data.delta
    )
