import React, { useEffect, useState } from 'react';
import { listWatchlist, updateWatch, removeWatch, getAggregatedPriceHistory } from '../api/watchlist';
import PriceHistoryChart from '../components/PriceHistoryChart.jsx';
import '../styles/Search.css'; // placeholder until watchlist.css

function formatRoubles(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString()}₽`;
}

export default function Watchlist() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ note: '', priority: 0, targetPrice: '', quantityNeeded: 1 });

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

  function openEditModal(item) {
    setEditingItem(item);
    setEditForm({
      note: item.note || '',
      priority: item.priority || 0,
      targetPrice: item.targetPrice || '',
      quantityNeeded: item.quantityNeeded || 1
    });
  }

  function closeEditModal() {
    setEditingItem(null);
    setEditForm({ note: '', priority: 0, targetPrice: '', quantityNeeded: 1 });
  }

  async function saveEdit() {
    if (!editingItem) return;

    try {
      await updateWatch(editingItem.item_id, {
        note: editForm.note || null,
        priority: parseInt(editForm.priority) || 0,
        targetPrice: editForm.targetPrice ? parseInt(editForm.targetPrice) : null,
        quantityNeeded: parseInt(editForm.quantityNeeded) || 1
      });
      closeEditModal();
      await load();
    } catch (err) {
      console.error('updateWatch failed', err);
      alert('Failed to update watchlist item');
    }
  }

  async function viewHistory(item) {
    try {
      const res = await getAggregatedPriceHistory(item.item_id, 7);
      console.log('Price history response:', res);

      if (res.source) {
        console.log(`Data source: ${res.source}`);
      }

      setPriceHistory({ itemName: item.item_name, data: res });
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
                    <th>Priority</th>
                    <th>Note</th>
                    <th>Target Price</th>
                    <th>Qty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.item_id}>
                      <td className="item-cell">
                        {r.iconLink && (
                          <img
                            src={r.iconLink}
                            alt={r.item_name}
                            className="item-icon"
                          />
                        )}

                        <a
                          href={r.wikiLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="item-link"
                        >
                          {r.item_name}
                        </a>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {r.priority > 0 ? (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: r.priority >= 3 ? '#d9534f' : r.priority >= 2 ? '#f0ad4e' : '#5bc0de',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}>
                            {r.priority}
                          </span>
                        ) : '-'}
                      </td>

                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.note || '-'}
                      </td>

                      <td>
                        {r.targetPrice ? formatRoubles(r.targetPrice) : '-'}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {r.quantityNeeded || 1}
                      </td>

                      <td className="actions-cell">
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => openEditModal(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => viewHistory(r)}
                        >
                          History
                        </button>
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

        {priceHistory && (
          <div className="search-card" style={{ marginTop: '2rem' }}>
            <PriceHistoryChart
              buyPrices={priceHistory.data.buyPrices}
              itemName={priceHistory.itemName}
            />
          </div>
        )}

        {editingItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div className="search-card" style={{ maxWidth: '500px', width: '90%' }}>
              <h2 className="search-title">Edit Watchlist Item</h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e5e7eb' }}>
                  Note
                </label>
                <textarea
                  className="search-input"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="Add a note (e.g., 'Need for quest')"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e5e7eb' }}>
                  Priority (0-5)
                </label>
                <input
                  type="number"
                  className="search-input"
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  min="0"
                  max="5"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e5e7eb' }}>
                  Target Price (₽)
                </label>
                <input
                  type="number"
                  className="search-input"
                  value={editForm.targetPrice}
                  onChange={(e) => setEditForm({ ...editForm, targetPrice: e.target.value })}
                  placeholder="e.g., 50000"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e5e7eb' }}>
                  Quantity Needed
                </label>
                <input
                  type="number"
                  className="search-input"
                  value={editForm.quantityNeeded}
                  onChange={(e) => setEditForm({ ...editForm, quantityNeeded: e.target.value })}
                  min="1"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="small-button secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="search-button"
                  onClick={saveEdit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
