import numpy as np


def generate_arrivals(
    lambda_rate,
    sim_time
):

    arrivals = []

    current_time = 0

    while current_time < sim_time:

        inter_arrival = np.random.exponential(
            1 / lambda_rate
        )

        current_time += inter_arrival

        arrivals.append(current_time)

    return arrivals
