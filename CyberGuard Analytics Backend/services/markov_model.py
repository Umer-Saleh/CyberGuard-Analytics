def compute_steady_state(
    lambda_rate,
    alpha,
    beta,
    gamma,
    delta
):

    denominator = (
        1
        + lambda_rate / (alpha + beta)
        + (beta * lambda_rate)
        / (gamma * (alpha + beta))
        + (beta * lambda_rate)
        / (delta * (alpha + beta))
    )

    pi0 = 1 / denominator

    pi1 = (
        lambda_rate
        / (alpha + beta)
    ) * pi0

    pi2 = (
        beta / gamma
    ) * pi1

    pi3 = (
        gamma / delta
    ) * pi2

    return [
        pi0,
        pi1,
        pi2,
        pi3
    ]
