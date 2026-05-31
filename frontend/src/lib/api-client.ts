export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const body = await parseJson(response);
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: string }).error)
        : `Erreur HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path);
}

export function apiPost<T>(path: string, payload?: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

export function apiPatch<T>(path: string, payload: unknown) {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function apiPut<T>(path: string, payload: unknown) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function apiDelete<T>(path: string) {
  return apiRequest<T>(path, { method: "DELETE" });
}
