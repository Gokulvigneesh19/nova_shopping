// Remembers reviewed products (and orders already prompted) per browser so we don't ask twice.
const REVIEWED_KEY = "novashop:reviewedProducts";
const PROMPTED_KEY = "novashop:reviewPromptedOrders";

const readList = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addToList = (key: string, value: string) => {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set([...readList(key), value])]));
  } catch {
    // Storage unavailable (private mode etc.); in-memory state still works.
  }
};

export const readReviewed = () => readList(REVIEWED_KEY);
export const markReviewed = (productId: string) => addToList(REVIEWED_KEY, productId);
export const hasUnreviewed = (productIds: string[]) => {
  const reviewed = readReviewed();
  return productIds.some((id) => !reviewed.includes(id));
};

export const wasPrompted = (orderId: string) => readList(PROMPTED_KEY).includes(orderId);
export const markPrompted = (orderId: string) => addToList(PROMPTED_KEY, orderId);
