import React from "react";

export default function PriceTable({ prices }){
  if (!prices?.length) return <p>No prices found.</p>;
  return (
    <table>
      <thead><tr><th>Source</th><th>Price</th><th>Currency</th></tr></thead>
      <tbody>
        {prices.map((p, idx)=>(
          <tr key={idx}>
            <td>{p.source}</td>
            <td>{p.price}</td>
            <td>{p.currency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
