"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/admin-client";
import { Alert } from "../../components/admin/fields";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      router.replace("/admin/books");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="adm-login-wrap">
      <form className="adm-login-card" onSubmit={submit}>
        <img src="/images/logo/logo-maroon-bg.png" alt="" />
        <h1>Admin login</h1>
        <p>Enter the admin password to manage the site.</p>
        {error && <Alert>{error}</Alert>}
        <div className="adm-field">
          <label className="sr-only" htmlFor="admPassword">Password</label>
          <input
            id="admPassword"
            className="adm-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
        </div>
        <button className="adm-btn adm-btn-primary" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
