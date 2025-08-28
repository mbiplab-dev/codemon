import fetch from "node-fetch";

export const proxyHandler = async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URL is required");

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      res.status(response.status).send(`Proxy fetch error: ${response.statusText}`);
      return;
    }

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    if (contentType && contentType.includes("text/html")) {
      res.setHeader("Content-Security-Policy", "");
      res.setHeader("X-Frame-Options", "ALLOWALL");

      let body = await response.text();
      const parsedUrl = new URL(targetUrl);
      const baseUrl = parsedUrl.origin;

      body = body.replace(/((href|src)=["'])([^"']+)/gi, (match, prefix, attr, url) => {
        let fullUrl;
        if (url.startsWith("http")) fullUrl = url;
        else if (url.startsWith("//")) fullUrl = parsedUrl.protocol + url;
        else if (url.startsWith("/")) fullUrl = baseUrl + url;
        else fullUrl = new URL(url, baseUrl).href;
        return `${prefix}/proxy?url=${encodeURIComponent(fullUrl)}`;
      });

      body = body.replace(/url\(["']?([^)"']+)["']?\)/gi, (match, url) => {
        if (url.startsWith("data:")) return match;
        let fullUrl = url.startsWith("http") ? url : new URL(url, baseUrl).href;
        return `url("/proxy?url=${encodeURIComponent(fullUrl)}")`;
      });

      res.send(body);
    } else {
      response.body.pipe(res);
    }
  } catch (err) {
    res.status(500).send("Error fetching URL: " + err.message);
  }
};
