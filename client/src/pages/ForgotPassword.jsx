import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import { Button, Input } from "../components/ui";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await forgotPassword({ email: email.trim() });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to send reset email",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md card-elevated space-y-5"
        noValidate
      >
        <div>
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your superadmin email to receive a reset link.
          </p>
        </div>
        <Input
          label="Gmail / Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
        {message && (
          <p className="p-3 rounded-xl bg-green-50 text-green-700 text-sm">
            {message}
          </p>
        )}
        {error && (
          <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Send reset link
        </Button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          Back to sign in
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
