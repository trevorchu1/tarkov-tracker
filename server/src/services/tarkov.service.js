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
        buyFor {
          source
          priceRUB
        }
        sellFor {
          source
          priceRUB
        }

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
          priceRUB
        }
        sellFor {
          source
          priceRUB
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

export async function getItemHistoricalPrices(itemId) {
  const query = `
    query ($id: ID!) {
      item(id: $id) {
        id
        name
        historicalPrices {
          price
          timestamp
        }
      }
    }
  `;

  console.log("[TarkovAPI] getItemHistoricalPrices", { itemId });

  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: itemId } }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    console.error(
      "[TarkovAPI] getItemHistoricalPrices error:",
      res.status,
      res.statusText,
      JSON.stringify(json.errors || "").slice(0, 200)
    );
    throw new Error(`Tarkov API error: ${res.status}`);
  }

  return json.data.item;
}

export async function getAllTraders() {
  const query = `
    query {
      traders {
        id
        name
        normalizedName
        description
        imageLink
        resetTime
        currency {
          name
        }
        levels {
          level
          requiredPlayerLevel
          requiredReputation
          insuranceRate
          repairCostMultiplier
        }
      }
    }
  `;

  console.log("[TarkovAPI] getAllTraders");

  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    console.error(
      "[TarkovAPI] getAllTraders error:",
      res.status,
      res.statusText,
      JSON.stringify(json.errors || "").slice(0, 200)
    );
    throw new Error(`Tarkov API error: ${res.status}`);
  }

  return json.data.traders || [];
}

export async function getTraderItems(traderName, limit = 5000) {
  const query = `
    query ($limit: Int) {
      items(limit: $limit) {
        id
        name
        shortName
        iconLink
        wikiLink
        buyFor {
          source
          vendor {
            name
            normalizedName
          }
          price
          currency
          priceRUB
        }
      }
    }
  `;

  console.log("[TarkovAPI] getTraderItems", { traderName, limit });

  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { limit } }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    console.error(
      "[TarkovAPI] getTraderItems error:",
      res.status,
      res.statusText,
      JSON.stringify(json.errors || "").slice(0, 200)
    );
    throw new Error(`Tarkov API error: ${res.status}`);
  }

  // Filter items sold by this trader
  const allItems = json.data.items || [];
  const traderItems = allItems.filter(item => {
    if (!item.buyFor) return false;
    return item.buyFor.some(offer =>
      offer.vendor &&
      offer.vendor.normalizedName === traderName.toLowerCase()
    );
  });

  return traderItems;
}

export async function getTraderBarters(traderName, limit = 50) {
  const query = `
    query ($limit: Int) {
      barters(limit: $limit) {
        id
        trader {
          name
          normalizedName
        }
        level
        taskUnlock {
          id
          name
        }
        requiredItems {
          item {
            id
            name
            iconLink
          }
          count
        }
        rewardItems {
          item {
            id
            name
            iconLink
          }
          count
        }
      }
    }
  `;

  console.log("[TarkovAPI] getTraderBarters", { traderName, limit });

  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { limit } }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    console.error(
      "[TarkovAPI] getTraderBarters error:",
      res.status,
      res.statusText,
      JSON.stringify(json.errors || "").slice(0, 200)
    );
    throw new Error(`Tarkov API error: ${res.status}`);
  }

  const allBarters = json.data.barters || [];
  const traderBarters = allBarters.filter(barter =>
    barter.trader &&
    barter.trader.normalizedName === traderName.toLowerCase()
  );

  return traderBarters;
}
