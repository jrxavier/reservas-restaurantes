import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTables, createTable, deleteTable, getRestaurant } from '../services/api';
import type { Table, Restaurant } from '../services/api';

export default function TablesPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [rest, tbls] = await Promise.all([
        getRestaurant(restaurantId!),
        getTables(restaurantId!),
      ]);
      setRestaurant(rest);
      setTables(tbls);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [restaurantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createTable(restaurantId!, { table_number: Number(tableNumber) });
      setTableNumber('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar mesa');
    }
  };

  const handleDelete = async (tableId: string, num: number) => {
    if (!confirm(`Excluir Mesa ${num}?`)) return;
    try {
      await deleteTable(restaurantId!, tableId);
      load();
    } catch {
      setError('Erro ao excluir mesa');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Voltar para Restaurantes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mesas</h1>
          {restaurant && <p className="text-gray-500">{restaurant.name}</p>}
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {tables.length} mesa(s) — capacidade: {tables.length * 4} pessoas
        </span>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleCreate} className="bg-white border rounded-xl p-5 mb-6 shadow-sm flex gap-3">
        <input
          required
          type="number"
          min="1"
          placeholder="Número da mesa"
          value={tableNumber}
          onChange={e => setTableNumber(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Adicionar Mesa
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : tables.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Nenhuma mesa cadastrada.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map(t => (
            <div key={t.id} className="bg-white border rounded-xl p-4 shadow-sm text-center">
              <div className="text-3xl mb-2">🪑</div>
              <p className="font-semibold text-gray-800">Mesa {t.table_number}</p>
              <p className="text-sm text-gray-500">Até {t.capacity} pessoas</p>
              <button
                onClick={() => handleDelete(t.id, t.table_number)}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
