import numpy as np

from services.markov_model import (
    compute_steady_state
)

from services.simulation import (
    run_markov_simulation
)


def monte_carlo_analysis(
    runs,
    params
):

    results = []

    for _ in range(runs):

        sim = run_markov_simulation(
            *params
        )

        results.append(sim)

    return results


def sensitivity_analysis(
    lambda_start,
    lambda_end,
    steps,
    alpha,
    beta,
    gamma,
    delta
):

    lambdas = np.linspace(
        lambda_start,
        lambda_end,
        steps
    )

    results = []

    for l in lambdas:

        pi = compute_steady_state(
            l,
            alpha,
            beta,
            gamma,
            delta
        )

        results.append(pi)

    return lambdas.tolist(), results


def reliability_analysis(
    gamma,
    delta
):

    mtbf = 1 / gamma

    availability = (
        delta /
        (gamma + delta)
    )

    failure_rate = gamma

    return {
        "mtbf": mtbf,
        "availability": availability,
        "failure_rate": failure_rate
    }
