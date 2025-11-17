import React from 'react';
import { useEffect, useState } from 'react';
import { listWatchlist, removeWatch } from '../api/watchlist';

export default function Watchlist(){
  const [rows,setRows] = useState([]);
  async function load(){ setRows(await listWatchlist()); }
  useEffect(()=>{ load(); }, []);
  async function remove(itemId){ await removeWatch(itemId); load(); }

  return (
    <div>
      <h2>Your Watchlist</h2>
      <ul>
        {rows.map(r=>(
          <li key={r.item_id}>
            {r.item_name} ({r.item_id})
            <button onClick={()=>remove(r.item_id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
