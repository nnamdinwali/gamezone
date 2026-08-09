import { useAuth } from "@clerk/react";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
} from "@workspace/api-client-react";

export function useCurrentUser() {
  const { isLoaded, isSignedIn } = useAuth();

  return useGetCurrentUser({
    query: {
      enabled: Boolean(isLoaded && isSignedIn),
      queryKey: getGetCurrentUserQueryKey(),
    },
  });
}