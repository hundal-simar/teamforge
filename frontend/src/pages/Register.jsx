import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: formRegister, handleSubmit } = useForm({
    defaultValues: {
      email: searchParams.get("email") || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const inviteToken = localStorage.getItem("pendingInviteToken");

      const result = await register({
        ...data,
        inviteToken: inviteToken || undefined,
      });

      localStorage.removeItem("pendingInviteToken");

      if (result?.joinedWorkspace) {
        navigate(`/workspace/${result.joinedWorkspace.slug}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Name"
          {...formRegister("name", { required: true })}
        />
        <input
          type="email"
          placeholder="Email"
          {...formRegister("email", { required: true })}
        />
        <input
          type="password"
          placeholder="Password"
          {...formRegister("password", { required: true })}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;