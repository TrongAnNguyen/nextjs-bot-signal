const CLOUDFLARE_KV_WORKER_URL = process.env.CLOUDFLARE_KV_WORKER_URL || "";

export const redis = {
  /**
   * Retrieves a value from KV.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const res = await fetch(
        `${CLOUDFLARE_KV_WORKER_URL}?key=${encodeURIComponent(key)}`,
        {
          next: { revalidate: 0 }, // Prevent Next.js from caching this fetch
        },
      );

      if (res.status === 404) return null;
      if (!res.ok) {
        console.error(`KV Worker Error: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      return data.value;
    } catch (error) {
      console.error("Redis Get Error:", error);
      return null;
    }
  },

  /**
   * Stores a value in KV with an optional TTL.
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const res = await fetch(CLOUDFLARE_KV_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, ttl }),
      });

      if (!res.ok) {
        console.error(`KV Worker Error: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Redis Set Error:", error);
    }
  },

  /**
   * Deletes a specific key.
   */
  async del(key: string): Promise<void> {
    try {
      const res = await fetch(
        `${CLOUDFLARE_KV_WORKER_URL}?key=${encodeURIComponent(key)}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        console.error(`KV Worker Error: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Redis Del Error:", error);
    }
  },

  /**
   * Deletes all keys matching a prefix.
   */
  async delPrefix(prefix: string): Promise<void> {
    try {
      const res = await fetch(
        `${CLOUDFLARE_KV_WORKER_URL}?prefix=${encodeURIComponent(prefix)}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        console.error(`KV Worker Error: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Redis DelPrefix Error:", error);
    }
  },
};
