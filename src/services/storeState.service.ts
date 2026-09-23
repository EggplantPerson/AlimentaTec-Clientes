const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/storeState`;

export async function getStoreState() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch store state");
  return res.json();
}
