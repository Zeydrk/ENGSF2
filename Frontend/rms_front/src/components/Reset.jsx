// Importing hooks
import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

export default function Reset() {
  const loginService = useAdmin();
  const location = useLocation()
  const navigate = useNavigate();
const searchParams = new URLSearchParams(window.location.search)
    // const token = searchParams.get("token")
//   const [searchParams] = useSearchParams();
  const token = searchParams.get('token')
  console.log(token)
  const [isLoading, setIsLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true)
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.", {
        className: "alert alert-error text-white",
      });
    } else {
      const response = await loginService.resetPassword(password, token);
      if (response) {
        toast.success("Your account has been reset!", {
          className: "alert alert-success text-white",
        });
        setTimeout(() => {
          setIsLoading(false);
          navigate("/login");
        }, 3000);
      } else {
        toast.error("An error occured!", {
          className: "alert alert-error text-white",
        });
        setIsLoading(false);
      }
    }
  }
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-base-200"
      data-theme="autumn"
    >
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <span className="loading loading-spinner loading-xl text-white"></span>
          <p className="text-white mt-4 text-lg">Logging in...</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold justify-center mb-4">
              Reset your password
            </h2>

            <div className="form-control mt-4">
              <label className="label" htmlFor="password">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                // setup
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label" htmlFor="password">
                <span className="label-text font-semibold">
                  Confirm Password
                </span>
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder="Confirm your password"
                className="input input-bordered w-full"
                onChange={handleConfirmPasswordChange}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <div className="form-control mt-4 text-center">
              <p>
                Go back to{" "}
                <Link to="/login" className="underline text-red-500">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
