export const api = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} ${body}`);
    }

    return response.json();
  },

  get(path) {
    return this.request(path, { method: "GET" });
  },

  put(path, data) {
    return this.request(path, { method: "PUT", body: JSON.stringify(data) });
  },
};
