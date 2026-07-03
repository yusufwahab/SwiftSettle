import { useCallback, useEffect, useState } from "react";

// Shared data-fetching pattern for every page: consistent loading / error /
// success states so no page can render blank while mock (or later, live)
// service calls are in flight.
export function useAsync(fn, deps = []) {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const run = useCallback(() => {
    setStatus("loading");
    setError("");
    fn()
      .then((result) => {
        setData(result);
        setStatus("success");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { status, data, error, reload: run };
}
