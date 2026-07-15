import hashlib

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import get_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_users_table():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT
            )
            """
        )

        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        existing_columns = {row[0] for row in cur.fetchall()}

        if 'name' not in existing_columns:
            cur.execute("ALTER TABLE users ADD COLUMN name TEXT")
        if 'email' not in existing_columns:
            cur.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if 'password' not in existing_columns:
            cur.execute("ALTER TABLE users ADD COLUMN password TEXT")

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(stored_password: str | None, password: str | None) -> bool:
    if not stored_password or not password:
        return False
    return stored_password == hash_password(password)


class User(BaseModel):
    name: str
    email: str
    password: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str | None = None

@app.post("/auth/signup")
def signup_user(user: User):
    ensure_users_table()

    conn = get_connection()
    cur = conn.cursor()

    try:
        if not user.password:
            raise HTTPException(status_code=400, detail="Password is required")

        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        existing_user = cur.fetchone()

        if existing_user:
            raise HTTPException(status_code=409, detail="Email already registered")

        hashed_password = hash_password(user.password)
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
            (user.name, user.email, hashed_password)
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        return {"id": user_id, "message": "Signup successful"}

    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cur.close()
        conn.close()

@app.post("/auth/login")
def login_user(payload: LoginRequest):
    ensure_users_table()

    conn = get_connection()
    cur = conn.cursor()

    try:
        if not payload.password:
            raise HTTPException(status_code=400, detail="Password is required")

        cur.execute("SELECT id, name, email, password FROM users WHERE email = %s", (payload.email,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(user[3], payload.password):
            raise HTTPException(status_code=401, detail="Invalid password")

        return {"id": user[0], "name": user[1], "email": user[2], "message": "Login successful"}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cur.close()
        conn.close()

@app.post("/users")
def create_user(user: User):
    ensure_users_table()

    conn = get_connection()
    cur = conn.cursor()

    try:
        hashed_password = hash_password(user.password) if user.password else None
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
            (user.name, user.email, hashed_password)
        )
        user_id = cur.fetchone()[0]
        conn.commit()

        return {"id": user_id, "message": "User created"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cur.close()
        conn.close()

@app.get("/users")
def get_users():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, name, email FROM users")
    users = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {"id": u[0], "name": u[1], "email": u[2]}
        for u in users
    ]

@app.get("/users/{user_id}")
def get_user(user_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user[0], "name": user[1], "email": user[2]}

@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE users SET name = %s, email = %s WHERE id = %s",
        (user.name, user.email, user_id)
    )

    conn.commit()

    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")

    cur.close()
    conn.close()

    return {"message": "User updated"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()

    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")

    cur.close()
    conn.close()

    return {"message": "User deleted"}