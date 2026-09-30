import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "./api";

/**
 * Loads data from the API when the page opens.
 *
 * "Still loading" means `data` and `error` are both null.
 * - `reload()` refetches quietly (the current data stays on screen meanwhile)
 * - `retry()` is for the "Try Again" button after a failed first load
 *
 * Pass a stable function (like the ones exported from lib/api.ts).
 */
export function useLoad<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setData(await loader());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [loader]);

  useEffect(() => {
    let ignore = false; // don't update state if the page was left before the response arrived
    loader()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      });
    return () => {
      ignore = true;
    };
  }, [loader]);

  const retry = () => {
    setError(null);
    reload();
  };

  return { data, error, reload, retry };
}
