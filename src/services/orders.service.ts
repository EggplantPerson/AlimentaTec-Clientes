const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/orders`;

export async function getOrder(uid: string) {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function createOrder(data: {
  uid: string;
  id: number;
  products: string[];
  total: number;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}
