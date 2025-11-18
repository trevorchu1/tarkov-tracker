import fetch from "node-fetch";

const BASE = process.env.TARKOV_API_BASE || "https://api.tarkov.dev/graphql";

export async function searchItemsByName(name) {
  const query = `
    query ($name: String) {
      items(name: $name) {
        id
        name
        shortName
        iconLink
        wikiLink

      }
    }
  `;

  console.log("[TarkovAPI] searchItemsByName", { name });

  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { name } }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    console.error(
      "[TarkovAPI] searchItemsByName error:",
      res.status,
      res.statusText,
      JSON.stringify(json.errors || "").slice(0, 200)
    );
    throw new Error(`Tarkov API error: ${res.status}`);
  }

  return json.data.items || [];
}

export async function getItemPriceSnapshot(itemId) {
  const query = `
    query ($id: ID!) {
      item(id: $id) {
        id
        name
        buyFor {
          source
          price
          currency
        }
        sellFor {
          source
          price
          currency
        }
      }
    }
  `;

  console.log("[TarkovAPI] getItemPriceSnapshot", { itemId });

  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: itemId } }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    console.error(
      "[TarkovAPI] getItemPriceSnapshot error:",
      res.status,
      res.statusText,
      JSON.stringify(json.errors || "").slice(0, 200)
    );
    throw new Error(`Tarkov API error: ${res.status}`);
  }

  return json.data.item;
}
