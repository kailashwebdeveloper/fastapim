import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("App UI", () => {
  it("shows the login form by default", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("switches to signup form when toggle is clicked", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

    expect(
      await screen.findByRole("heading", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
  });

  it("shows dashboard after a successful login", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "Alice",
          email: "alice@example.com",
          message: "Login successful",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    });
  });

  it("renders the add user form when add user is clicked", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "Alice",
          email: "alice@example.com",
          message: "Login successful",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /add user/i }));

    expect(
      screen.getByRole("heading", { name: /add user/i }),
    ).toBeInTheDocument();
  });

  it("shows an error message when login fails", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Invalid credentials" }),
      });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("allows deleting a user from the dashboard", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "Alice",
          email: "alice@example.com",
          message: "Login successful",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: "Alice", email: "alice@example.com" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ detail: "Deleted" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/user deleted/i)).toBeInTheDocument();
    });
  });

  it("supports editing an existing user from the dashboard", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "Alice",
          email: "alice@example.com",
          message: "Login successful",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: "Alice", email: "alice@example.com" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ detail: "Updated" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Alice Updated" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "newsecret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => {
      expect(screen.getByText(/user updated/i)).toBeInTheDocument();
    });
  });

  it("keeps the form accessible with labels and button names", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    expect(screen.getByPlaceholderText(/email/i)).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create an account/i }),
    ).toBeInTheDocument();
  });
});
