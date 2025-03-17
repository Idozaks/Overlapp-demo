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
      const res = await fetch(queryKey[0] as string, {
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