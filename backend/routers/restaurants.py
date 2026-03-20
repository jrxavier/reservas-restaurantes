from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


class RestaurantCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


@router.get("/")
def list_restaurants():
    response = supabase.table("restaurants").select("*").order("name").execute()
    return response.data


@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: str):
    response = supabase.table("restaurants").select("*").eq("id", restaurant_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return response.data[0]


@router.post("/", status_code=201)
def create_restaurant(restaurant: RestaurantCreate):
    response = supabase.table("restaurants").insert(restaurant.model_dump()).execute()
    return response.data[0]


@router.put("/{restaurant_id}")
def update_restaurant(restaurant_id: str, restaurant: RestaurantUpdate):
    data = {k: v for k, v in restaurant.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    response = supabase.table("restaurants").update(data).eq("id", restaurant_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return response.data[0]


@router.delete("/{restaurant_id}", status_code=204)
def delete_restaurant(restaurant_id: str):
    response = supabase.table("restaurants").delete().eq("id", restaurant_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
