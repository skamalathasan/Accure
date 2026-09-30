import type { Summary, Transaction, TransactionInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

/** Turns FastAPI's error responses into one readable sentence. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      // Validation errors: [{ loc: ["body", "amount"], msg: "..." }]
      return body.detail
        .map((item: { loc: (string | number)[]; msg: string }) => {
          const field = item.loc.slice(1).join(" ");
          const message = item.msg.replace(/^Value error, /, "");
          return field ? `${field}: ${message}` : message;
        })
        .join(". ");
    }
  } catch {
    // body wasn't JSON - fall through
  }
  return response.status >= 500
    ? "The server ran into a problem. Please try again."
    : `The request failed (status ${response.status}).`;
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(`Can't reach the Accure server at ${API_URL}. Check that the backend is running.`);
  }

  if (!response.ok) throw new ApiError(await readErrorMessage(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export const getTransactions = () => request<Transaction[]>("/transactions");
export const getSummary = () => request<Summary>("/summary");

export const createTransaction = (input: TransactionInput) =>
  request<Transaction>("/transactions", { method: "POST", body: input });

export const updateTransaction = (id: number, input: TransactionInput) =>
  request<Transaction>(`/transactions/${id}`, { method: "PUT", body: input });

export const deleteTransaction = (id: number) =>
  request<void>(`/transactions/${id}`, { method: "DELETE" });
