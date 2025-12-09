import React from "react";

function formatRoubles(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString()}₽`;
}

function getSourceDisplayName(source) {
  const sourceMap = {
    'BUY - fleaMarket': 'Buy from Flea Market',
    'SELL - fleaMarket': 'Sell to Flea Market',
    'BUY - prapor': 'Buy from Prapor',
    'SELL - prapor': 'Sell to Prapor',
    'BUY - therapist': 'Buy from Therapist',
    'SELL - therapist': 'Sell to Therapist',
    'BUY - fence': 'Buy from Fence',
    'SELL - fence': 'Sell to Fence',
    'BUY - skier': 'Buy from Skier',
    'SELL - skier': 'Sell to Skier',
    'BUY - peacekeeper': 'Buy from Peacekeeper',
    'SELL - peacekeeper': 'Sell to Peacekeeper',
    'BUY - mechanic': 'Buy from Mechanic',
    'SELL - mechanic': 'Sell to Mechanic',
    'BUY - ragman': 'Buy from Ragman',
    'SELL - ragman': 'Sell to Ragman',
    'BUY - jaeger': 'Buy from Jaeger',
    'SELL - jaeger': 'Sell to Jaeger',
    'BUY - ref': 'Buy from Ref',
    'SELL - ref': 'Sell to Ref',
  };
  return sourceMap[source] || source;
}

export default function PriceTable({ prices }){
  if (!prices?.length) {
    return <p className="no-results">No prices found.</p>;
  }

  return (
    <div className="results-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p, idx)=>(
            <tr key={idx}>
              <td style={{ fontWeight: '500' }}>{getSourceDisplayName(p.source)}</td>
              <td>{formatRoubles(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
