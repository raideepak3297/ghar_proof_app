import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { UserRole } from "../types";
import { ArrowRight, AlertCircle, Building2, User, Lock } from "lucide-react";
import { AppLogo } from "../components/common/AppLogo";

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("landlord");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email || !phone || !password) {
      toast("Please fill in all required fields", "error");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email,
        phone,
        password,
        role,
      });
      toast("Account created successfully", "success");
      navigate("/", { replace: true });
    } catch (err: any) {
      let msg = "Registration failed.";
      if (err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "85vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2.5rem 1rem",
      background: "radial-gradient(circle at 50% 15%, #eef2ff 0%, #f8fafc 65%, #f1f5f9 100%)",
    }}>
      <div className="card" style={{
        maxWidth: "440px",
        width: "100%",
        padding: "2.25rem 2rem",
        borderRadius: "16px",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}>
        {/* App Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "0.85rem" }}>
            <AppLogo size={52} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Create your account
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.25rem" }}>
            Join GharProof for secure rental verification
          </p>
        </div>

        {errorMessage && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "0.7rem 0.9rem",
            borderRadius: "8px",
            marginBottom: "1.25rem",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vibrant Distinct Role Selector */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>
              I am registering as
            </label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "10px",
            }}>
              {/* Landlord Option */}
              <button
                type="button"
                onClick={() => setRole("landlord")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                  padding: "0.6rem 0.5rem",
                  borderRadius: "8px",
                  border: role === "landlord" ? "1px solid #4338ca" : "1px solid transparent",
                  background: role === "landlord" ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" : "transparent",
                  color: role === "landlord" ? "#ffffff" : "#64748b",
                  fontWeight: role === "landlord" ? 700 : 500,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  boxShadow: role === "landlord" ? "0 4px 10px rgba(79, 70, 229, 0.35)" : "none",
                  transition: "all 150ms ease",
                }}
              >
                <Building2 size={16} color={role === "landlord" ? "#ffffff" : "#64748b"} />
                <span>Landlord</span>
              </button>

              {/* Tenant Option */}
              <button
                type="button"
                onClick={() => setRole("tenant")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                  padding: "0.6rem 0.5rem",
                  borderRadius: "8px",
                  border: role === "tenant" ? "1px solid #047857" : "1px solid transparent",
                  background: role === "tenant" ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "transparent",
                  color: role === "tenant" ? "#ffffff" : "#64748b",
                  fontWeight: role === "tenant" ? 700 : 500,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  boxShadow: role === "tenant" ? "0 4px 10px rgba(5, 150, 105, 0.35)" : "none",
                  transition: "all 150ms ease",
                }}
              >
                <User size={16} color={role === "tenant" ? "#ffffff" : "#64748b"} />
                <span>Tenant</span>
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>First Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Deepak"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>Last Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Rai"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: "8px", border: "1.5px solid #cbd5e1", padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.7rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.45rem",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
              transition: "all 150ms ease",
            }}
          >
            <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.84rem" }}>
          <span style={{ color: "#64748b" }}>Already registered? </span>
          <Link to="/login" style={{ fontWeight: 600, color: "#4f46e5" }}>Sign in</Link>
        </div>

        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          fontSize: "0.74rem",
          color: "#94a3b8",
        }}>
          <Lock size={12} />
          <span>SHA-256 Tamper-Proof Cryptographic Security</span>
        </div>
      </div>
    </div>
  );
};
