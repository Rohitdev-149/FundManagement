import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import { Button, Input } from "../components/ui";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    setError("");
    try {
      const response = await resetPassword({
        token: searchParams.get("token"),
        password,
      });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to reset password",
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
        <h1 className="text-2xl font-bold">Set new password</h1>
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
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
          Reset password
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

export default ResetPassword;
