import { useDeviceStore } from "../store/deviceStore";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/orders`;

// Consulta si ya existe una orden registrada para este dispositivo (por su uid)
export async function getOrderByUid(uid: string) {
  const res = await fetch(`${API_URL}/${uid}`);

  if (res.status === 404) {
    return null;
  }

  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(responseText || "Failed to fetch order");
  }

  return JSON.parse(responseText);
}

// Crea una nueva orden (solo debe usarse cuando el dispositivo no tiene una previa)
async function createOrder(data: {
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

  console.log("Respuesta del servidor (create):", res.status, responseText);

  if (!res.ok) {
    throw new Error(responseText || "Failed to create order");
  }

  return JSON.parse(responseText);
}

// Actualiza la orden existente de este dispositivo con los nuevos productos
async function updateOrder(
  uid: string,
  data: Partial<{
    products: string[];
    total: number;
    status: string;
    notes: string;
  }>,
) {
  const res = await fetch(`${API_URL}/${uid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseText = await res.text();

  console.log("Respuesta del servidor (update):", res.status, responseText);

  if (!res.ok) {
    throw new Error(responseText || "Failed to update order");
  }

  return JSON.parse(responseText);
}

// Función principal: usa siempre el uid fijo del dispositivo y decide
// automáticamente si crear una orden nueva o actualizar la existente.
export async function submitOrder(data: {
  id: number;
  products: string[];
  total: number;
}) {
  const uid = useDeviceStore.getState().ensureDeviceId();

  const existingOrder = await getOrderByUid(uid);

  if (existingOrder) {
    return updateOrder(uid, {
      products: data.products,
      total: data.total,
      status: "En espera",
    });
  }

  return createOrder({ ...data, uid });
}

export async function deleteOrder(uid: string) {
  const res = await fetch(`${API_URL}/${uid}`, {
    method: "DELETE",
  });

  // El backend responde 204 sin body cuando el borrado es exitoso
  if (res.status === 204) {
    return true;
  }

  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(responseText || "Failed to delete order");
  }

  return true;
}
