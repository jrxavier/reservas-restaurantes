import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants, createRestaurant, deleteRestaurant } from '../services/api';
import type { Restaurant } from '../services/api';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setRestaurants(await getRestaurants());
    } catch {
      setError('Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRestaurant(form);
      setForm({ name: '', address: '', phone: '' });
      setShowForm(false);
      load();
    } catch {
      setError('Erro ao criar restaurante');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await deleteRestaurant(id);
      load();
    } catch {
      setError('Erro ao excluir restaurante');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Restaurantes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Novo Restaurante
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Novo Restaurante</h2>
          <div className="grid gap-4">
            <input
              required
              placeholder="Nome do restaurante"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <input
              placeholder="Endereço"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <input
              placeholder="Telefone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Salvar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Nenhum restaurante cadastrado.</p>
      ) : (
        <div className="grid gap-4">
          {restaurants.map(r => (
            <div key={r.id} className="bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{r.name}</h2>
                {r.address && <p className="text-gray-500 text-sm">{r.address}</p>}
                {r.phone && <p className="text-gray-500 text-sm">{r.phone}</p>}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/restaurants/${r.id}/tables`}
                  className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 transition"
                >
                  Mesas
                </Link>
                <Link
                  to={`/restaurants/${r.id}/reservations`}
                  className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-200 transition"
                >
                  Reservas
                </Link>
                <button
                  onClick={() => handleDelete(r.id, r.name)}
                  className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-200 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
