from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from _db import get_conn, get_cursor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TileIn(BaseModel):
    name: str
    text_configurable: bool = False
    multi_slot: bool = False
    required: bool = False


@app.get("/api/tiles")
def list_tiles():
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute("SELECT * FROM tiles ORDER BY id")
            return cur.fetchall()
    finally:
        conn.close()


@app.post("/api/tiles", status_code=201)
def create_tile(tile: TileIn):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute(
                """INSERT INTO tiles (name, text_configurable, multi_slot, required)
                   VALUES (%s, %s, %s, %s) RETURNING *""",
                (tile.name, tile.text_configurable, tile.multi_slot, tile.required),
            )
            row = cur.fetchone()
            conn.commit()
            return row
    finally:
        conn.close()


@app.put("/api/tiles/{tile_id}")
def update_tile(tile_id: int, tile: TileIn):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute(
                """UPDATE tiles SET name=%s, text_configurable=%s, multi_slot=%s, required=%s
                   WHERE id=%s RETURNING *""",
                (tile.name, tile.text_configurable, tile.multi_slot, tile.required, tile_id),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Tile not found")
            conn.commit()
            return row
    finally:
        conn.close()


@app.delete("/api/tiles/{tile_id}", status_code=204)
def delete_tile(tile_id: int):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute("DELETE FROM tiles WHERE id=%s", (tile_id,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Tile not found")
            conn.commit()
    finally:
        conn.close()


