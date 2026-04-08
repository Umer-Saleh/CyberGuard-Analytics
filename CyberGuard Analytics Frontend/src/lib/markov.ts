/**
 * Steady-state distribution π for the CTMC (matches `services/markov_model.py` on the backend).
 */
export function computeSteadyState(
  lambdaRate: number,
  alpha: number,
  beta: number,
  gamma: number,
  delta: number,
): [number, number, number, number] {
  const ab = alpha + beta;
  const denominator =
    1 +
    lambdaRate / ab +
    (beta * lambdaRate) / (gamma * ab) +
    (beta * lambdaRate) / (delta * ab);
  const pi0 = 1 / denominator;
  const pi1 = (lambdaRate / ab) * pi0;
  const pi2 = (beta / gamma) * pi1;
  const pi3 = (gamma / delta) * pi2;
  return [pi0, pi1, pi2, pi3];
}

/** Compromised-state probability π₂ (used as breach / risk proxy in charts). */
export function compromisedProb(
  lambdaRate: number,
  alpha: number,
  beta: number,
  gamma: number,
  delta: number,
): number {
  return computeSteadyState(lambdaRate, alpha, beta, gamma, delta)[2];
}
