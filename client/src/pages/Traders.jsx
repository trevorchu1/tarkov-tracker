import React, { useEffect, useState } from 'react';
import { getTraders, getTraderItems, getTraderBarters, getAggregatedPriceHistory, addWatch } from '../api/watchlist';
import PriceHistoryChart from '../components/PriceHistoryChart.jsx';
import '../styles/Search.css';

function formatRoubles(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toLocaleString()}₽`;
}

export default function Traders() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [traderItems, setTraderItems] = useState([]);
  const [traderBarters, setTraderBarters] = useState([]);
  const [viewMode, setViewMode] = useState('items'); // 'items' or 'barters'
  const [itemsLoading, setItemsLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState(null);

  useEffect(() => {
    loadTraders();
  }, []);

  async function loadTraders() {
    try {
      const data = await getTraders();
      const excludedTraders = ['lightkeeper', 'btr-driver', 'btrdriver', 'radiostation', 'radio-station', 'taran', 'mrkerman', 'mr-kerman', 'voevoda'];
      const filteredTraders = (data || []).filter(trader => {
        const normalized = trader.normalizedName?.toLowerCase();
        return !excludedTraders.includes(normalized);
      });
      setTraders(filteredTraders);
    } catch (err) {
      console.error('getTraders failed', err);
    } finally {
      setLoading(false);
    }
  }

  async function selectTrader(trader) {
    setSelectedTrader(trader);
    setViewMode('items');
    setItemsLoading(true);

    try {
      const itemsData = await getTraderItems(trader.normalizedName);
      setTraderItems(itemsData.items || []);
    } catch (err) {
      console.error('getTraderItems failed', err);
      setTraderItems([]);
    } finally {
      setItemsLoading(false);
    }
  }

  async function loadBarters() {
    if (!selectedTrader) return;
    setViewMode('barters');
    setItemsLoading(true);

    try {
      const bartersData = await getTraderBarters(selectedTrader.normalizedName);
      setTraderBarters(bartersData.barters || []);
    } catch (err) {
      console.error('getTraderBarters failed', err);
      setTraderBarters([]);
    } finally {
      setItemsLoading(false);
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
      <div className="search-container" style={{ width: '100%', maxWidth: '1000px' }}>
        <div className="search-card">
          <h1 className="search-title">Traders</h1>

          {loading ? (
            <p className="no-results">Loading traders…</p>
          ) : traders.length === 0 ? (
            <p className="no-results">No traders found.</p>
          ) : (
            <div className="results-wrapper">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: '400px' }}>
                {traders.map((trader) => (
                  <div
                    key={trader.id}
                    onClick={() => selectTrader(trader)}
                    style={{
                      cursor: 'pointer',
                      padding: '1rem',
                      border: selectedTrader?.id === trader.id ? '2px solid #4CAF50' : '1px solid #ddd',
                      borderRadius: '8px',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      height: 'fit-content'
                    }}
                  >
                    {trader.imageLink && (
                      <img
                        src={trader.imageLink}
                        alt={trader.name}
                        style={{ width: '100%', height: 'auto', marginBottom: '0.5rem' }}
                      />
                    )}
                    <h3 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>{trader.name}</h3>
                    {trader.currency && (
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                        Currency: {trader.currency.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedTrader && (
          <div className="search-card" style={{ marginTop: '2rem', height: '700px', boxSizing: 'border-box', overflow: 'hidden', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', height: '40px' }}>
              <h2 className="search-title" style={{ margin: 0 }}>{selectedTrader.name}</h2>
              <div>
                <button
                  className={viewMode === 'items' ? 'search-button' : 'small-button secondary'}
                  onClick={() => {
                    setViewMode('items');
                    if (traderItems.length === 0) selectTrader(selectedTrader);
                  }}
                  style={{ marginRight: '0.5rem' }}
                >
                  Items
                </button>
                <button
                  className={viewMode === 'barters' ? 'search-button' : 'small-button secondary'}
                  onClick={loadBarters}
                >
                  Barters
                </button>
              </div>
            </div>

            <div style={{ height: '4rem', marginBottom: '1rem', color: '#666', overflow: 'auto', fontSize: '0.875rem', lineHeight: '1.4' }}>
              {selectedTrader.description || ''}
            </div>

            <div style={{ minHeight: '500px', maxHeight: '500px', overflowY: 'auto' }}>
              {itemsLoading ? (
                <p className="no-results">Loading…</p>
              ) : viewMode === 'items' ? (
                traderItems.length === 0 ? (
                  <p className="no-results">No items found for this trader.</p>
                ) : (
                  <div className="results-wrapper">
                    <table className="results-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traderItems.map((item) => {
                        const traderOffer = item.buyFor?.find(
                          offer => offer.vendor?.normalizedName === selectedTrader.normalizedName
                        );

                        return (
                          <tr key={item.id}>
                            <td className="item-cell">
                              {item.iconLink && (
                                <img
                                  src={item.iconLink}
                                  alt={item.name}
                                  className="item-icon"
                                />
                              )}
                              <a
                                href={item.wikiLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="item-link"
                              >
                                {item.name}
                              </a>
                            </td>
                            <td>
                              {traderOffer ? (
                                <>
                                  {formatRoubles(traderOffer.priceRUB)}
                                  {traderOffer.currency && traderOffer.currency !== 'RUB' && (
                                    <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                                      ({traderOffer.price} {traderOffer.currency})
                                    </span>
                                  )}
                                </>
                              ) : '-'}
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  type="button"
                                  className="small-button"
                                  onClick={() => add(item)}
                                  style={{ minWidth: '140px', whiteSpace: 'nowrap' }}
                                >
                                  Add to Watchlist
                                </button>
                                <button
                                  type="button"
                                  className="small-button"
                                  onClick={() => viewHistory(item)}
                                  style={{ minWidth: '120px', whiteSpace: 'nowrap' }}
                                >
                                  Price History
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              traderBarters.length === 0 ? (
                <p className="no-results">No barter trades found for this trader.</p>
              ) : (
                <div className="results-wrapper">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Required Items</th>
                        <th>Reward Item</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traderBarters.map((barter) => (
                        <tr key={barter.id}>
                          <td>
                            {barter.requiredItems?.map((req, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                                {req.item?.iconLink && (
                                  <img
                                    src={req.item.iconLink}
                                    alt={req.item.name}
                                    className="item-icon"
                                    style={{ marginRight: '0.75rem' }}
                                  />
                                )}
                                {req.item?.wikiLink ? (
                                  <a
                                    href={req.item.wikiLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="item-link"
                                  >
                                    {req.item?.name} × {req.count}
                                  </a>
                                ) : (
                                  <span>{req.item?.name} × {req.count}</span>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="item-cell">
                            {barter.rewardItems?.[0]?.item?.iconLink && (
                              <img
                                src={barter.rewardItems[0].item.iconLink}
                                alt={barter.rewardItems[0].item.name}
                                className="item-icon"
                              />
                            )}
                            {barter.rewardItems?.[0]?.item?.wikiLink ? (
                              <a
                                href={barter.rewardItems[0].item.wikiLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="item-link"
                              >
                                {barter.rewardItems?.[0]?.item?.name} × {barter.rewardItems?.[0]?.count}
                              </a>
                            ) : (
                              <span>{barter.rewardItems?.[0]?.item?.name} × {barter.rewardItems?.[0]?.count}</span>
                            )}
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button
                                type="button"
                                className="small-button"
                                onClick={() => add(barter.rewardItems?.[0]?.item)}
                                style={{ minWidth: '140px', whiteSpace: 'nowrap' }}
                              >
                                Add to Watchlist
                              </button>
                              <button
                                type="button"
                                className="small-button"
                                onClick={() => viewHistory(barter.rewardItems?.[0]?.item)}
                                style={{ minWidth: '120px', whiteSpace: 'nowrap' }}
                              >
                                Price History
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
            </div>
          </div>
        )}

        {priceHistory && (
          <div className="search-card" style={{ marginTop: '2rem' }}>
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
