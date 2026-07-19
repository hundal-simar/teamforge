import React from "react";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {useForm} from "react-hook-form";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
        />
        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: true })}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;