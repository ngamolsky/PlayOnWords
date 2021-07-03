import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../../generated/graphql";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}) {
  const { data, loading, refetch } = useMeQuery();
  const user = data?.me;
  const router = useRouter();

  useEffect(() => {
    if (!redirectTo || loading) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user)
    ) {
      router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo, loading, router]);
  return { user, refetch };
}
