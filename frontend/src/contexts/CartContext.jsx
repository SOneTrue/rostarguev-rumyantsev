import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const add = (p) => setItems((prev) => [...prev, { ...p, quantity: 1 }]);
  const updateQty = (id, q) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: q } : i)),
    );
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
