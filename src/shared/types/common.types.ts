export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
