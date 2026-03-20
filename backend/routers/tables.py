from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter(prefix="/restaurants", tags=["tables"])


class TableCreate(BaseModel):
    table_number: int


class TableUpdate(BaseModel):
    table_number: Optional[int] = None


@router.get("/{restaurant_id}/tables")
def list_tables(restaurant_id: str):
    response = (
        supabase.table("tables")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("table_number")
        .execute()
    )
    return response.data


@router.post("/{restaurant_id}/tables", status_code=201)
def create_table(restaurant_id: str, table: TableCreate):
    # Verificar se restaurante existe
    rest = supabase.table("restaurants").select("id").eq("id", restaurant_id).execute()
    if not rest.data:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    data = {"restaurant_id": restaurant_id, "table_number": table.table_number, "capacity": 4}
    response = supabase.table("tables").insert(data).execute()
    return response.data[0]


@router.put("/{restaurant_id}/tables/{table_id}")
def update_table(restaurant_id: str, table_id: str, table: TableUpdate):
    data = {k: v for k, v in table.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    response = (
        supabase.table("tables")
        .update(data)
        .eq("id", table_id)
        .eq("restaurant_id", restaurant_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    return response.data[0]


@router.delete("/{restaurant_id}/tables/{table_id}", status_code=204)
def delete_table(restaurant_id: str, table_id: str):
    response = (
        supabase.table("tables")
        .delete()
        .eq("id", table_id)
        .eq("restaurant_id", restaurant_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
