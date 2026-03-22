from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from mangum import Mangum
from _db import get_conn, get_cursor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AllocationIn(BaseModel):
    tile_id: int
    person: str
    day: str
    slot: str
    custom_text: Optional[str] = None
    week_start: str


@app.get("/api/allocations")
def list_allocations(week_start: str = Query(...)):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute(
                "SELECT * FROM allocations WHERE week_start=%s ORDER BY id",
                (week_start,),
            )
            return cur.fetchall()
    finally:
        conn.close()


@app.post("/api/allocations", status_code=201)
def create_allocation(alloc: AllocationIn):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute(
                """INSERT INTO allocations (tile_id, person, day, slot, custom_text, week_start)
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
                (alloc.tile_id, alloc.person, alloc.day, alloc.slot, alloc.custom_text, alloc.week_start),
            )
            row = cur.fetchone()
            conn.commit()
            return row
    finally:
        conn.close()


@app.delete("/api/allocations")
def clear_allocations(week_start: str = Query(...)):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute("DELETE FROM allocations WHERE week_start=%s", (week_start,))
            conn.commit()
    finally:
        conn.close()


@app.delete("/api/allocations/{alloc_id}", status_code=204)
def delete_allocation(alloc_id: int):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute("DELETE FROM allocations WHERE id=%s", (alloc_id,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Allocation not found")
            conn.commit()
    finally:
        conn.close()


handler = Mangum(app)
