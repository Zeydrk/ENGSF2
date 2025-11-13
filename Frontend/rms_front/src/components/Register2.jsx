// Importing hooks
import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { useAccount } from "../hooks/useAccount"; 
import { Link, useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Main function
export default function Register() {
  // Hooks and states
  const loginService = useAdmin();
  const accountService = useAccount();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")




  //   Setting handlers for input changes
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value)
  }
  const handleMiddleNameChange = (e) => {
    setMiddleName(e.target.value)
  }
  const handleLastNameChange = (e) => {
    setLastName(e.target.value)
  }


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  }

  // Setting function for alert

  // Setting handler for input submission
  async function handleSubmit(e) {
    e.preventDefault();
    // check if the passwords match, if it does, it will not accept it
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.", {
        className: "alert alert-error text-white",
      });
    }
    else{
        // Make sure to add the middleware after learning it this friday
        const user = { email, password };
        const response = await accountService.createAccount(user)
        if (response) {
          alert("Registration successful! You can now log in.");
          navigate("/");
        } else {
          alert("Registration failed. Please try again.");
        }
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
              Register
            </h2>

            <div className="form-control">
              <label className="label" htmlFor="firstName">
                <span className="label-text font-semibold">First Name</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                className="input input-bordered w-full"
                onChange={handleFirstNameChange}
                required
              />
            </div>

            <div className="form-control mt-2">
              <label className="label" htmlFor="middleName">
                <span className="label-text font-semibold">Middle Name</span>
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                placeholder="Enter your middle name"
                className="input input-bordered w-full"
                onChange={handleMiddleNameChange}
                required
              />
            </div>


            <div className="form-control mt-2">
              <label className="label" htmlFor="lastName">
                <span className="label-text font-semibold">Last Name</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                className="input input-bordered w-full"
                onChange={handleLastNameChange}
                required
              />
            </div>

            <div className="form-control mt-2">
              <label className="label" htmlFor="email">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                onChange={handleEmailChange}
                required
              />
            </div>

            <div className="form-control mt-2">
              <label className="label" htmlFor="password">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                minLength={8}
                maxLength={20}
                // setup
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-control mt-2">
              <label className="label" htmlFor="password">
                <span className="label-text font-semibold">Confirm Password</span>
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
              <button type="submit" className="btn btn-primary w-full">
                Login
              </button>
            </div>

            <div className="form-control mt-4 text-center">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline text-red-500"
                >
                  Click Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
