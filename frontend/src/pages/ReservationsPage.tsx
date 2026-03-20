import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getReservations, createReservation, cancelReservation,
  checkAvailability, getRestaurant,
} from '../services/api';
import type { Reservation, Restaurant, AvailabilityResponse } from '../services/api';

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

export default function ReservationsPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    num_people: 1,
  });

  const load = async () => {
    try {
      const [rest, resv] = await Promise.all([
        getRestaurant(restaurantId!),
        getReservations(restaurantId),
      ]);
      setRestaurant(rest);
      setReservations(resv);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [restaurantId]);

  const handleCheckAvailability = async () => {
    if (!form.reservation_date || !form.reservation_time || !form.num_people) return;
    setCheckingAvail(true);
    setAvailability(null);
    try {
      const result = await checkAvailability({
        restaurant_id: restaurantId!,
        date: form.reservation_date,
        time: form.reservation_time,
        num_people: form.num_people,
      });
      setAvailability(result);
    } catch {
      setError('Erro ao verificar disponibilidade');
    } finally {
      setCheckingAvail(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createReservation({ restaurant_id: restaurantId!, ...form });
      setForm({ customer_name: '', customer_phone: '', reservation_date: '', reservation_time: '', num_people: 1 });
      setAvailability(null);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar reserva');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await cancelReservation(id);
      load();
    } catch {
      setError('Erro ao cancelar reserva');
    }
  };

  const updateForm = (field: string, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
    setAvailability(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Voltar para Restaurantes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reservas</h1>
          {restaurant && <p className="text-gray-500">{restaurant.name}</p>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Nova Reserva
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Nova Reserva</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Nome do cliente"
              value={form.customer_name}
              onChange={e => updateForm('customer_name', e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Telefone"
              value={form.customer_phone}
              onChange={e => updateForm('customer_phone', e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <div>
              <label className="text-sm text-gray-600 block mb-1">Data</label>
              <input
                required
                type="date"
                value={form.reservation_date}
                onChange={e => updateForm('reservation_date', e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Horário</label>
              <input
                required
                type="time"
                value={form.reservation_time}
                onChange={e => updateForm('reservation_time', e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nº de pessoas</label>
              <input
                required
                type="number"
                min="1"
                value={form.num_people}
                onChange={e => updateForm('num_people', Number(e.target.value))}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={checkingAvail || !form.reservation_date || !form.reservation_time}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
            >
              {checkingAvail ? 'Verificando...' : 'Verificar Disponibilidade'}
            </button>
          </div>

          {availability && (
            <div className={`mt-3 p-3 rounded-lg ${availability.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {availability.available
                ? `✅ ${availability.message} — ${availability.tables_needed} mesa(s) serão alocadas`
                : `❌ ${availability.message}`}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={availability !== null && !availability.available}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              Confirmar Reserva
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setAvailability(null); }}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="grid gap-4">
          {reservations.map(r => (
            <div
              key={r.id}
              className={`bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between ${r.status === 'cancelled' ? 'opacity-60' : ''}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">{r.customer_name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  📅 {r.reservation_date} às {r.reservation_time.slice(0, 5)}
                </p>
                <p className="text-gray-500 text-sm">
                  👥 {r.num_people} pessoas — {r.tables_needed} mesa(s)
                </p>
                {r.customer_phone && <p className="text-gray-500 text-sm">📞 {r.customer_phone}</p>}
              </div>
              {r.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(r.id)}
                  className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
