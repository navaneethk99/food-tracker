import { getConvexSiteUrl } from "@/lib/auth";

async function proxy(request: Request) {
  const requestUrl = new URL(request.url);
  const targetUrl = `${getConvexSiteUrl()}${requestUrl.pathname}${requestUrl.search}`;
  const headers = new Headers(request.headers);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const requestInit: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
  };
  headers.set("accept-encoding", "identity");
  headers.set("host", new URL(getConvexSiteUrl()).host);

  if (hasBody) {
    requestInit.duplex = "half";
  }

  const response = await fetch(
    new Request(targetUrl, requestInit),
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
