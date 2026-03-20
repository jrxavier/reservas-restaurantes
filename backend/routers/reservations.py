import math
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter(prefix="/reservations", tags=["reservations"])


class ReservationCreate(BaseModel):
    restaurant_id: str
    customer_name: str
    customer_phone: Optional[str] = None
    reservation_date: str  # formato: YYYY-MM-DD
    reservation_time: str  # formato: HH:MM
    num_people: int


def tables_needed(num_people: int) -> int:
    """Calcula a quantidade de mesas necessárias (múltiplos de 4)."""
    return math.ceil(num_people / 4)


def get_available_tables(restaurant_id: str, date: str, time: str) -> list:
    """Retorna mesas disponíveis para o restaurante na data e horário informados."""
    # Buscar todas as mesas do restaurante
    all_tables = (
        supabase.table("tables")
        .select("id")
        .eq("restaurant_id", restaurant_id)
        .execute()
    ).data
    all_table_ids = {t["id"] for t in all_tables}

    # Buscar reservas confirmadas no mesmo dia e horário
    reservations = (
        supabase.table("reservations")
        .select("id")
        .eq("restaurant_id", restaurant_id)
        .eq("reservation_date", date)
        .eq("reservation_time", time)
        .eq("status", "confirmed")
        .execute()
    ).data
    reserved_ids = [r["id"] for r in reservations]

    # Buscar mesas já ocupadas nessas reservas
    occupied_table_ids = set()
    if reserved_ids:
        occupied = (
            supabase.table("reservation_tables")
            .select("table_id")
            .in_("reservation_id", reserved_ids)
            .execute()
        ).data
        occupied_table_ids = {o["table_id"] for o in occupied}

    available = list(all_table_ids - occupied_table_ids)
    return available


@router.get("/")
def list_reservations(
    restaurant_id: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
):
    query = supabase.table("reservations").select("*, restaurants(name)").order("reservation_date").order("reservation_time")
    if restaurant_id:
        query = query.eq("restaurant_id", restaurant_id)
    if date:
        query = query.eq("reservation_date", date)
    return query.execute().data


@router.get("/availability")
def check_availability(
    restaurant_id: str = Query(...),
    date: str = Query(...),
    time: str = Query(...),
    num_people: int = Query(...),
):
    needed = tables_needed(num_people)
    available = get_available_tables(restaurant_id, date, time)
    has_availability = len(available) >= needed
    return {
        "available": has_availability,
        "tables_needed": needed,
        "tables_available": len(available),
        "message": "Disponível" if has_availability else "Sem disponibilidade para a quantidade de pessoas informada",
    }


@router.get("/{reservation_id}")
def get_reservation(reservation_id: str):
    response = (
        supabase.table("reservations")
        .select("*, restaurants(name), reservation_tables(table_id, tables(table_number))")
        .eq("id", reservation_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    return response.data[0]


@router.post("/", status_code=201)
def create_reservation(reservation: ReservationCreate):
    if reservation.num_people < 1:
        raise HTTPException(status_code=400, detail="Número de pessoas deve ser pelo menos 1")

    needed = tables_needed(reservation.num_people)
    available = get_available_tables(
        reservation.restaurant_id,
        reservation.reservation_date,
        reservation.reservation_time,
    )

    if len(available) < needed:
        raise HTTPException(
            status_code=409,
            detail=f"Sem disponibilidade: necessário {needed} mesa(s), disponível {len(available)} mesa(s)",
        )

    # Criar a reserva
    res_data = {
        "restaurant_id": reservation.restaurant_id,
        "customer_name": reservation.customer_name,
        "customer_phone": reservation.customer_phone,
        "reservation_date": reservation.reservation_date,
        "reservation_time": reservation.reservation_time,
        "num_people": reservation.num_people,
        "tables_needed": needed,
        "status": "confirmed",
    }
    res = supabase.table("reservations").insert(res_data).execute().data[0]

    # Alocar as mesas
    tables_to_allocate = available[:needed]
    allocation = [
        {"reservation_id": res["id"], "table_id": tid} for tid in tables_to_allocate
    ]
    supabase.table("reservation_tables").insert(allocation).execute()

    return {**res, "allocated_tables": tables_to_allocate}


@router.delete("/{reservation_id}", status_code=204)
def cancel_reservation(reservation_id: str):
    response = (
        supabase.table("reservations")
        .update({"status": "cancelled"})
        .eq("id", reservation_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
