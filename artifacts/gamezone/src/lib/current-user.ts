import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
} from "@workspace/api-client-react";

export function useCurrentUser() {
  return useGetCurrentUser({
    query: {
      enabled: true,
      retry: false,
      refetchOnWindowFocus: false,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });
}
