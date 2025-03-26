import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`HTTP error! status: ${res.status}, text: ${text}`); // Added error logging
    throw new Error(`${res.status}: ${text}`);
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function apiRequest(url: string, options?: RequestOptions): Promise<Response> {
  const isFormData = options?.body instanceof FormData;
  try {
    const res = await fetch(url, {
      method: options?.method || 'GET',
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
      },
      body: isFormData
        ? options?.body
        : options?.body ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("Error in apiRequest:", error); // Added error logging
    throw error; // Re-throw the error for handling higher up
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Handle array queryKeys by constructing the proper URL
      let url = queryKey[0] as string;
      
      // If queryKey has more parts, construct the URL
      if (queryKey.length > 1) {
        // For pattern like ['/api/conversations', id, 'messages']
        for (let i = 1; i < queryKey.length; i++) {
          if (typeof queryKey[i] === 'string' && queryKey[i].startsWith('?')) {
            // Handle query params
            url += queryKey[i];
          } else if (i === queryKey.length - 1 && typeof queryKey[i] === 'string') {
            // Last item is a string (e.g., 'messages', 'participants')
            url += `/${queryKey[i]}`;
          } else if (queryKey[i] !== null && queryKey[i] !== undefined) {
            // Middle items are likely IDs
            url += `/${queryKey[i]}`;
          }
        }
      }
      
      console.log(`Making fetch request to: ${url}`);
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error("Error in getQueryFn:", error); // Added error logging
      throw error; // Re-throw the error
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});