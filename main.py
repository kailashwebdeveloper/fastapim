from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db import get_connection

app = FastAPI()

class User(BaseModel):
    name: str
    email: str

@app.post("/users")
def create_user(user: User):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id",
            (user.name, user.email)
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