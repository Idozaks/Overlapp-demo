import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`HTTP error! status: ${res.status}, text: ${text}`); // Added error logging
    throw new Error(`${res.status}: ${text}`);
  }
}

interface RequestOptions {
  url?: string;
  method?: string;
  body?: unknown;
  data?: unknown;
}

export async function apiRequest<T = any>(url: string | RequestOptions, options?: RequestOptions): Promise<T> {
  // Handle the case where the first argument is the options object
  let requestUrl: string;
  let requestOptions: RequestOptions = {};

  if (typeof url === 'string') {
    requestUrl = url;
    requestOptions = options || {};
  } else {
    requestUrl = url.url as string;
    requestOptions = url;
  }
  
  // Use 'data' or 'body' field for consistency with axios
  const bodyData = requestOptions.data || requestOptions.body;
  const isFormData = bodyData instanceof FormData;
  try {
    console.log(`Making API request to: ${requestUrl}`, requestOptions);
    const res = await fetch(requestUrl, {
      method: requestOptions.method || 'GET',
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        "Accept": "application/json"
      },
      body: isFormData
        ? bodyData as FormData
        : bodyData ? JSON.stringify(bodyData) : undefined,
      credentials: "include",
    });
    
    await throwIfResNotOk(res);
    
    // Try to parse as JSON, but handle text response if not valid JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await res.json();
        return data;
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        const text = await res.text();
        console.log("Response text:", text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
    } else {
      const text = await res.text();
      console.log("Non-JSON response received:", text.substring(0, 100));
      return { text } as unknown as T;
    }
  } catch (error) {
    console.error("Error in apiRequest:", error); // Added error logging
    throw error; // Re-throw the error for handling higher up
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <TData = unknown>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<TData> =
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
            // If it's an object, don't append it to the URL path
            if (typeof queryKey[i] !== 'object') {
              url += `/${queryKey[i]}`;
            } else {
              console.warn(`Object passed in queryKey position ${i}, skipping:`, queryKey[i]);
            }
          }
        }
      }
      
      console.log(`Making fetch request to: ${url}`);
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json"
        },
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Try to parse as JSON, but handle text response if not valid JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          return await res.json();
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
          const text = await res.text();
          console.log("Response text:", text.substring(0, 100));
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
      } else {
        const text = await res.text();
        console.log("Non-JSON response received:", text.substring(0, 100));
        return { text } as unknown as TData;
      }
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