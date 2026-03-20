import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  capacity: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  num_people: number;
  tables_needed: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  restaurants?: { name: string };
}

export interface AvailabilityResponse {
  available: boolean;
  tables_needed: number;
  tables_available: number;
  message: string;
}

// Restaurants
export const getRestaurants = () => api.get<Restaurant[]>('/restaurants/').then(r => r.data);
export const getRestaurant = (id: string) => api.get<Restaurant>(`/restaurants/${id}`).then(r => r.data);
export const createRestaurant = (data: Omit<Restaurant, 'id' | 'created_at'>) =>
  api.post<Restaurant>('/restaurants/', data).then(r => r.data);
export const updateRestaurant = (id: string, data: Partial<Omit<Restaurant, 'id' | 'created_at'>>) =>
  api.put<Restaurant>(`/restaurants/${id}`, data).then(r => r.data);
export const deleteRestaurant = (id: string) => api.delete(`/restaurants/${id}`);

// Tables
export const getTables = (restaurantId: string) =>
  api.get<Table[]>(`/restaurants/${restaurantId}/tables`).then(r => r.data);
export const createTable = (restaurantId: string, data: { table_number: number }) =>
  api.post<Table>(`/restaurants/${restaurantId}/tables`, data).then(r => r.data);
export const deleteTable = (restaurantId: string, tableId: string) =>
  api.delete(`/restaurants/${restaurantId}/tables/${tableId}`);

// Reservations
export const getReservations = (restaurantId?: string, date?: string) =>
  api.get<Reservation[]>('/reservations/', { params: { restaurant_id: restaurantId, date } }).then(r => r.data);
export const createReservation = (data: {
  restaurant_id: string;
  customer_name: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  num_people: number;
}) => api.post<Reservation>('/reservations/', data).then(r => r.data);
export const cancelReservation = (id: string) => api.delete(`/reservations/${id}`);
export const checkAvailability = (params: {
  restaurant_id: string;
  date: string;
  time: string;
  num_people: number;
}) => api.get<AvailabilityResponse>('/reservations/availability', { params }).then(r => r.data);

export default api;
