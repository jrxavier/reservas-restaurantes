import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RestaurantsPage from './pages/RestaurantsPage';
import TablesPage from './pages/TablesPage';
import ReservationsPage from './pages/ReservationsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-800">Sistema de Reservas</h1>
          </div>
        </header>
        <main className="py-6">
          <Routes>
            <Route path="/" element={<RestaurantsPage />} />
            <Route path="/restaurants/:restaurantId/tables" element={<TablesPage />} />
            <Route path="/restaurants/:restaurantId/reservations" element={<ReservationsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
