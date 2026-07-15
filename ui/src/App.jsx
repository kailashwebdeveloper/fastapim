import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [formUser, setFormUser] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showEditView, setShowEditView] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload =
        mode === "signup" ? { name, email, password } : { email, password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }

      setLoggedInUser(data);
      setMessage(data.message || "Success");
      setName("");
      setEmail("");
      setPassword("");
      setMode("dashboard");
      fetchUsers();
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isEditing ? `/users/${formUser.id}` : "/users";
      const method = isEditing ? "PUT" : "POST";
      const payload = {
        name: formUser.name,
        email: formUser.email,
        password: formUser.password,
      };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }

      setMessage(isEditing ? "User updated" : "User added");
      setFormUser({ id: null, name: "", email: "", password: "" });
      setIsEditing(false);
      setShowEditView(false);
      fetchUsers();
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }
      setMessage("User deleted");
      fetchUsers();
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    }
  };

  const startEdit = (user) => {
    setFormUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
    });
    setIsEditing(true);
    setShowEditView(true);
  };

  const logout = () => {
    setLoggedInUser(null);
    setMode("login");
    setMessage("Logged out");
  };

  if (loggedInUser && mode === "dashboard") {
    return (
      <div className="page dashboard-page">
        <div className="card dashboard-card">
          <div className="dashboard-header">
            <div>
              <h1>Welcome, {loggedInUser.name}</h1>
              <p>{loggedInUser.email}</p>
            </div>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>

          {showEditView ? (
            <div>
              <h2>{isEditing ? "Edit user" : "Add user"}</h2>
              <form onSubmit={handleAddOrUpdate}>
                <input
                  type="text"
                  placeholder="Name"
                  value={formUser.name}
                  onChange={(e) =>
                    setFormUser({ ...formUser, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formUser.email}
                  onChange={(e) =>
                    setFormUser({ ...formUser, email: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formUser.password}
                  onChange={(e) =>
                    setFormUser({ ...formUser, password: e.target.value })
                  }
                  required
                />
                <div className="edit-actions">
                  <button type="submit" disabled={loading}>
                    {isEditing ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setShowEditView(false);
                      setIsEditing(false);
                      setFormUser({
                        id: null,
                        name: "",
                        email: "",
                        password: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <button
                className="add-btn"
                onClick={() => {
                  setFormUser({ id: null, name: "", email: "", password: "" });
                  setIsEditing(false);
                  setShowEditView(true);
                }}
              >
                Add User
              </button>

              {message && <p className="message">{message}</p>}

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <button
                          className="small-btn"
                          onClick={() => startEdit(user)}
                        >
                          Update
                        </button>
                        <button
                          className="small-btn danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>{mode === "signup" ? "Create account" : "Welcome back"}</h1>
        <p>
          {mode === "signup"
            ? "Sign up with your name, email, and password."
            : "Login with your email and password."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Sign up"
                : "Login"}
          </button>
        </form>

        <button
          className="toggle"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Create an account" : "Already have an account?"}
        </button>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default App;
