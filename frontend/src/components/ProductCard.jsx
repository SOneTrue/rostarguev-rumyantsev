import { useCart } from '../contexts/CartContext';
import { useEffect, useState } from 'react';

export default function ProductCard({ product }) {
  const { items, add } = useCart();
  const [inCart, setInCart] = useState(false);

  // Проверка: есть ли товар уже в корзине
  useEffect(() => {
    const found = items.find((i) => i.id === product.id);
    setInCart(!!found);
  }, [items, product.id]);

  // Добавляем товар с минимальной ценой и магазином
  const handleAdd = () => {
    const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
    const cheapest = sortedPrices[0];

    add({
      id: product.id,
      name: product.name,
      price: cheapest.price,
      store: cheapest.store?.name ?? '-',
    });

    setInCart(true);
  };

  // Найдём минимальную цену для отображения (для подсветки)
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
              </span>
            </div>
          ))}
        </div>

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
