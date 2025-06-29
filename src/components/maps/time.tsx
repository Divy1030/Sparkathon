import { useState } from "react";

export default function Home() {
  const [locations, setLocations] = useState(["", ""]);
  const [result, setResult] = useState<{ distance: number; duration: number } | null>(null);

  const handleChange = (index: number, value: string) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Route Optimizer</h2>
      {locations.map((loc, i) => (
        <input
          key={i}
          value={loc}
          onChange={(e) => handleChange(i, e.target.value)}
          placeholder={`Location ${i + 1}`}
          style={{ marginBottom: 10, display: "block" }}
        />
      ))}
      <button onClick={handleSubmit}>Get Optimized Route</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h4>Distance: {(result.distance / 1000).toFixed(2)} km</h4>
          <h4>Duration: {(result.duration / 60).toFixed(2)} minutes</h4>
        </div>
      )}
    </div>
  );
}
