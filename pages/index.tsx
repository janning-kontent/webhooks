import React, { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/facebook")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => setError(error.message));
  }, []);

  return (
    <div>
      <h1>Kontent.ai - Social Posting</h1>
      {error ? (
        <div style={{ color: "red" }}>
          <h2>Error</h2>
          <pre>{error}</pre>
        </div>
      ) : data ? (
        <div>
          <h2>Webhook Data</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>No data received yet.</p>
      )}
    </div>
  );
}
