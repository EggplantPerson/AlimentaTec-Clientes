const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/orders`;

export async function createOrder(data: {
  uid: string;
  id: number;
  products: string[];
  total: number;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseText = await res.text();

  console.log("Respuesta del servidor:", res.status, responseText);

  if (!res.ok) {
    throw new Error(responseText || "Failed to create order");
  }

  return JSON.parse(responseText);
}
