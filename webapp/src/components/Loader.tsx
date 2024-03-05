import { useEffect, useState } from "react";
import { XWordContainer } from "./XWordContainer";

export const Loader = <Type,>({
  loadingMessage,
  errorMessage,
  loader,
  children,
}: {
  loadingMessage: string;
  errorMessage?: string;
  loader: () => Promise<Type | void>;
  children: (
    data: Type,
    reload: (params?: any) => Promise<Type | void>,
    setError: (error: string) => void
  ) => React.ReactNode;
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Type>();
  const [error, setError] = useState(errorMessage);

  useEffect(() => {
    loader()
      .then((data) => {
        if (data) {
          setData(data);
        }
      })
      .catch((error) => {
        setError(error.toString());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loader]);

  const reload = async () => {
    setLoading(true);
    setError(undefined);
    setData(undefined);

    try {
      const data = await loader();
      if (data) {
        setData(data);
      }
    } catch (error: any) {
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return loading || error || !data ? (
    <XWordContainer loadingMessage={"Loading..."} />
  ) : (
    <>{children(data, reload, setError)}</>
  );
};
