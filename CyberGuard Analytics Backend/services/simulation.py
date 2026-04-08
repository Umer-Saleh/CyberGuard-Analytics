import numpy as np


def run_markov_simulation(
    lambda_rate,
    alpha,
    beta,
    gamma,
    delta,
    sim_time,
):
    """
    Gillespie-style simulation over a finite horizon [0, sim_time].

    Time accumulated in each state matches the horizon (no extra sojourn time past sim_time).
    """
    current_time = 0.0
    state = 0
    time_in_state = [0.0, 0.0, 0.0, 0.0]
    eps = 1e-12

    while current_time < sim_time - eps:
        if state == 0:
            rate = lambda_rate
            next_state = 1
        elif state == 1:
            rate = alpha + beta
            prob_defense = alpha / (alpha + beta)
        elif state == 2:
            rate = gamma
            next_state = 3
        else:
            rate = delta
            next_state = 0

        holding_time = np.random.exponential(1.0 / rate)
        remaining = sim_time - current_time
        if remaining <= eps:
            break

        effective_time = float(min(holding_time, remaining))
        time_in_state[state] += effective_time
        current_time += effective_time

        # Horizon reached mid-sojourn: stop without transitioning
        if effective_time < holding_time - eps:
            break

        if state == 1:
            if np.random.rand() < prob_defense:
                state = 0
            else:
                state = 2
        else:
            state = next_state

    total_time = sum(time_in_state)
    if total_time <= eps:
        return [0.25, 0.25, 0.25, 0.25]

    # Partition of [0, sim_time]: unnormalized sojourn times must match the horizon.
    if sim_time > eps:
        tol = max(1e-9, 1e-10 * sim_time)
        if abs(total_time - sim_time) > tol:
            raise RuntimeError(
                f"simulation horizon mismatch: sum(time_in_state)={total_time} sim_time={sim_time}"
            )

    return [t / total_time for t in time_in_state]
