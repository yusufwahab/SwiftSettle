// Shared helper for every mock service so latency and failure behavior is
// consistent across the app. Real service implementations replace the
// `resolve`/`setTimeout` internals with an actual fetch to Nomba — the
// call signature that pages use (an async function returning data or
// throwing an Error) stays identical.

export function simulate(data, { delay = 600, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        reject(new Error("Network error. Please try again."));
        return;
      }
      resolve(data);
    }, delay);
  });
}
