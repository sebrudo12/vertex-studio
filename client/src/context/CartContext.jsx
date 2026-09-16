import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vx_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("vx_cart", JSON.stringify(items));
  }, [items]);

  const add = (product) => {
    if (items.find((i) => i.id === product.id)) {
      toast.info("Already in your cart");
      return;
    }
    setItems([...items, { id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug }]);
    toast.success(`${product.name} added to cart`);
  };

  const remove = (id) => setItems(items.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + Number(i.price), 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
