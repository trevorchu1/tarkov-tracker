import React, { useState } from 'react';
import { searchItems, addWatch, getPrices, getAggregatedPriceHistory } from '../api/watchlist';
import PriceTable from '../components/PriceTable.jsx';
import PriceHistoryChart from '../components/PriceHistoryChart.jsx';
import '../styles/Search.css';

function getTraderPrice(item) {
  if (!item || !Array.isArray(item.buyFor)) return null;

  const traderOffers = item.buyFor.filter(
    (o) => o && o.source && o.source !== 'fleaMarket'
  );
  if (!traderOffers.length) return null;

  const best = traderOffers.reduce((bestSoFar, offer) => {
    if (!bestSoFar) return offer;
    const a = bestSoFar.priceRUB ?? 0;
    const b = offer.priceRUB ?? 0;
    return b < a ? offer : bestSoFar;
  }, null);

  return best?.priceRUB ?? null;
}

function getFleaPrice(item) {
  if (!item || !Array.isArray(item.buyFor)) return null;

  const fleaOffer = item.buyFor.find(
    (o) => o && o.source === 'fleaMarket'
  );

  return fleaOffer?.priceRUB ?? null;
}


function formatRoubles(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString()}₽`;
}

export default function Search() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [prices, setPrices] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);

  async function doSearch(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!q.trim()) return;

    try {
      const res = await searchItems(q);
      console.log("RAW SEARCH RESULTS:", res);
      window.__items = res; // debug
      setItems(res || []);
      setPrices(null);
    } catch (err) {
      console.error('searchItems failed', err);
    }
  }

  async function viewPrices(item) {
    try {
      const res = await getPrices(item.id);
      setPrices(res.prices || []);
    } catch (err) {
      console.error('getPrices failed', err);
    }
  }

  async function add(item) {
    try {
      await addWatch({
        item_id: item.id,
        item_name: item.name,
        iconLink: item.iconLink,
        wikiLink: item.wikiLink
      });
      alert('Added to watchlist');
    } catch (err) {
      console.error('addWatch failed', err);
      alert('Failed to add to watchlist');
    }
  }

  async function viewHistory(item) {
    try {
      const res = await getAggregatedPriceHistory(item.id, 7);
      console.log('Price history response:', res);

      if (res.source) {
        console.log(`Data source: ${res.source}`);
      }

      setPriceHistory({ itemName: item.name, data: res });
    } catch (err) {
      console.error('getAggregatedPriceHistory failed', err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`Failed to load price history: ${errorMsg}`);
    }
  }

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-card">
          <h1 className="search-title">Market Search</h1>

          <form className="search-form" onSubmit={doSearch}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search item"
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          {items.length > 0 ? (
            <div className="results-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Trader price</th>
                    <th>Flea price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td className="item-cell">
                        {i.iconLink && (
                          <img
                            src={i.iconLink}
                            alt={i.name}
                            className="item-icon"
                          />
                        )}

                        <a
                          href={i.wikiLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="item-link"
                        >
                          {i.name}
                        </a>
                      </td>

                      <td>{formatRoubles(getTraderPrice(i))}</td>
                      <td>{formatRoubles(getFleaPrice(i))}</td>

                      <td className="actions-cell">
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => viewPrices(i)}
                        >
                          View Prices
                        </button>
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => viewHistory(i)}
                        >
                          Price History
                        </button>
                        <button
                          type="button"
                          className="small-button secondary"
                          onClick={() => add(i)}
                      >
                         + Watch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          
          
          ) : (
            <p className="no-results">No results yet — try a search.</p>
          )}
        </div>
        {prices && (
          <div className="prices-section">
            <h2 className="prices-title">Price snapshot</h2>
            <PriceTable prices={prices} />
          </div>
        )}

        {priceHistory && (
          <div className="prices-section">
            <PriceHistoryChart
              buyPrices={priceHistory.data.buyPrices}
              itemName={priceHistory.itemName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
