import { useCart } from '../contexts/CartContext';
import { useEffect, useState } from 'react';

export default function ProductCard({ product }) {
  const { items, add, error, setError } = useCart();
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const found = items.find((i) => i.id === product.id);
    setInCart(!!found);
  }, [items, product.id]);

  const handleAdd = () => {
    setError('');
    const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
    const cheapest = sortedPrices[0];

    add({
      id: product.id,
      name: product.name,
      price: cheapest.price,
      store: cheapest.store?.name ?? '-',
      store_id: cheapest.store?.id ?? cheapest.store,
      stock: cheapest.stock ?? 99,
    });

    setInCart(true);
  };

  const minPrice = Math.min(...product.prices.map((p) => Number(p.price)));

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition">
      <img
        src={product.image ?? `https://picsum.photos/seed/${product.id}/400/300`}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>

        <div className="space-y-1 mb-3">
          {product.prices.map((p, index) => (
            <div className="flex justify-between text-sm" key={index}>
              <span className="text-gray-600">{p.store?.name ?? p.store}:</span>
              <span
                className={`font-medium ${
                  Number(p.price) > minPrice ? 'text-red-500 line-through' : ''
                }`}
              >
                {p.price} ₽
                {p.stock !== undefined && (
                  <span className="text-xs text-gray-500 ml-2">
                    (в наличии: {p.stock})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-2 text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleAdd}
          disabled={inCart}
          className={`w-full py-2 rounded transition ${
            inCart
              ? 'bg-red-600 text-white cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {inCart ? 'В корзине' : 'В корзину'}
        </button>
      </div>
    </div>
  );
}
