import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin"; 

export default function Login({ onLogin }) {
  const loginService = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //   Setting handlers for input changes
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Setting function for alert



  // Setting handler for input submission
  async function handleSubmit(e) {
    e.preventDefault();
    // console.log(`Username: ${username}, Password: ${password}`);
    const user = { username, password };
    const response = await loginService.fetchAdmins(user);
    console.log("Login API response:", response);

    if (response) {
      alert("Login successful!");
      onLogin(); // Notify parent component of successful login
    } else {
      alert("Login failed. Please check your credentials.");
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-base-200"
      data-theme="autumn"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold justify-center mb-4">
              Login
            </h2>

            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text font-semibold">Username</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                className="input input-bordered w-full"
                onChange={handleUsernameChange}
                required
              />
            </div>

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
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full">
                Login
              </button>
            </div>

            <div className="form-control mt-4 text-center">
              <p>
                Don't have a account?{" "}
                <a href="" className="underline text-red-500">
                  Register Here
                </a>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
