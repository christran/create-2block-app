import { NextRequest } from "next/server";

export const getClientIP = (req: NextRequest) => {
  const ip = req.headers.get("CF-Connecting-IP") 
    ?? req.headers.get("Client_IP") 
    ?? req.headers.get("X-Forwarded-For")?.split(",")[0] 
    ?? req.headers.get("X-Real-IP") 
    ?? "127.0.0.1";

  if (ip === "127.0.0.1") {
    console.log("[Warning] Using default IP '127.0.0.1' because none of the request headers contained a valid IP address.");
  }

  return ip;
}