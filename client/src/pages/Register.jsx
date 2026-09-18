import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { Button, Input } from "../components/ui";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4 py-8">
      <form
        onSubmit={submit}
        className="w-full max-w-md card-elevated space-y-5"
        noValidate
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Create account
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Create your account to get started
          </p>
        </div>
        <Input
          label="Name"
          value={form.name}
          onChange={update("name")}
          required
          autoComplete="name"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          placeholder="9999999999"
          required
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />
        {error && (
          <p
            className="p-3 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] text-sm"
            role="alert"
          >
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" fullWidth loading={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          Already have an account? Sign in
        </button>
      </form>
    </div>
  );
};

export default Register;
