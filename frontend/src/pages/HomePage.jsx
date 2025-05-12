import { useEffect, useState } from 'react';
import { fetchProducts } from '@/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Все товары</h2>

      {/* заглушка фильтров (можно заменить на реальные) */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select className="border rounded px-3 py-2">
          <option>Все категории</option>
        </select>
        <select className="border rounded px-3 py-2">
          <option>Все магазины</option>
        </select>
        <input
          type="text"
          placeholder="Поиск..."
          className="border rounded px-3 py-2 flex-grow"
        />
      </div>

      {/* продукты */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
