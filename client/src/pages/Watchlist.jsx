import React, { useEffect, useState } from 'react';
import { listWatchlist, removeWatch } from '../api/watchlist';
import '../styles/Search.css'; // reuse the same styling as Search

function formatRoubles(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString()}₽`;
}

export default function Watchlist() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await listWatchlist();
      setRows(data || []);
    } catch (err) {
      console.error('listWatchlist failed', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(itemId) {
    try {
      await removeWatch(itemId);
      await load();
    } catch (err) {
      console.error('removeWatch failed', err);
    }
  }

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-card">
          <h1 className="search-title">Your Watchlist</h1>

          {loading ? (
            <p className="no-results">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="no-results">
              Your watchlist is empty. Add items from the Market Search page.
            </p>
          ) : (
            <div className="results-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.item_id}>
                      <td className="item-cell">
                        {/* Icon – assumes backend returns r.iconLink */}
                        {r.iconLink && (
                          <img
                            src={r.iconLink}
                            alt={r.item_name}
                            className="item-icon"
                          />
                        )}

                        {/* Wiki link – assumes backend returns r.wikiLink */}
                        <a
                          href={r.wikiLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="item-link"
                        >
                          {r.item_name}
                        </a>
                      </td>

                      <td className="actions-cell">
                        <button
                          type="button"
                          className="small-button secondary"
                          onClick={() => remove(r.item_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
