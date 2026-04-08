from pydantic import BaseModel, Field
from typing import List


class SimulationInput(BaseModel):
    lambda_rate: float = Field(gt=0, description="Attack arrival rate")
    alpha: float = Field(gt=0, description="Defense success rate")
    beta: float = Field(gt=0, description="Breach success rate")
    gamma: float = Field(gt=0, description="Recovery rate")
    delta: float = Field(gt=0, description="Patch completion rate")
    sim_time: float = Field(gt=0, description="Simulation horizon (time units)")


class MonteCarloInput(SimulationInput):
    """Same payload as simulation; used for batch stochastic runs."""


class SimulationResult(BaseModel):
    theoretical: List[float]
    simulation: List[float]


class MonteCarloResult(BaseModel):
    runs: int
    results: List[List[float]]


class SensitivityInput(BaseModel):
    lambda_start: float = Field(gt=0)
    lambda_end: float = Field(gt=0)
    steps: int = Field(ge=2, le=500)
    alpha: float = Field(gt=0)
    beta: float = Field(gt=0)
    gamma: float = Field(gt=0)
    delta: float = Field(gt=0)


class ComparativeInput(BaseModel):
    scenarioA: SimulationInput
    scenarioB: SimulationInput


class ReliabilityResult(BaseModel):
    mtbf: float
    availability: float
    failure_rate: float


class ReliabilityInput(BaseModel):
    gamma: float = Field(default=0.2, gt=0)
    delta: float = Field(default=0.1, gt=0)
