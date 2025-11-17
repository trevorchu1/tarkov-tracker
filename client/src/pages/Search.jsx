import { useState } from 'react';
import React from 'react';
import { searchItems, addWatch, getPrices } from '../api/watchlist';
import PriceTable from '../components/PriceTable.jsx';

export default function Search(){
  const [q,setQ] = useState('');
  const [items,setItems] = useState([]);
  const [prices,setPrices] = useState(null);

  async function doSearch(){
    setItems(await searchItems(q));
  }
  async function viewPrices(item){
    const res = await getPrices(item.id);
    setPrices(res.prices || []);
  }
  async function add(item){
    await addWatch({ item_id: item.id, item_name: item.name });
    alert('Added to watchlist');
  }

  return (
    <div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search item"/>
      <button onClick={doSearch}>Search</button>
      <ul>
        {items.map(i=>(
          <li key={i.id}>
            {i.name}{' '}
            <button onClick={()=>viewPrices(i)}>View Prices</button>{' '}
            <button onClick={()=>add(i)}>+ Watch</button>
          </li>
        ))}
      </ul>

      {prices && <PriceTable prices={prices} />}
    </div>
  );
}
