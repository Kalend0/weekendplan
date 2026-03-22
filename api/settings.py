from fastapi import FastAPI
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


class SettingsIn(BaseModel):
    pin: Optional[str] = None
    name_person_1: Optional[str] = None
    name_person_2: Optional[str] = None


@app.get("/api/settings")
def get_settings():
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            cur.execute("SELECT id, pin, name_person_1, name_person_2 FROM settings WHERE id=1")
            return cur.fetchone()
    finally:
        conn.close()


@app.put("/api/settings")
def update_settings(body: SettingsIn):
    conn = get_conn()
    try:
        with get_cursor(conn) as cur:
            # Upsert so first-run works even if seed wasn't run
            cur.execute(
                """INSERT INTO settings (id, pin, name_person_1, name_person_2)
                   VALUES (1, %s, %s, %s)
                   ON CONFLICT (id) DO UPDATE SET
                     pin = COALESCE(EXCLUDED.pin, settings.pin),
                     name_person_1 = COALESCE(EXCLUDED.name_person_1, settings.name_person_1),
                     name_person_2 = COALESCE(EXCLUDED.name_person_2, settings.name_person_2)
                   RETURNING *""",
                (
                    body.pin or '0000',
                    body.name_person_1 or '',
                    body.name_person_2 or '',
                ),
            )
            row = cur.fetchone()
            conn.commit()
            return row
    finally:
        conn.close()


handler = Mangum(app)
