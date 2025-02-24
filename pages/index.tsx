import React, { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/webhook")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <h1>Webhook Data</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No data received yet.</p>
      )}
    </div>
  );
}
