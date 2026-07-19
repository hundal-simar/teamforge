import React from "react";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {useForm} from "react-hook-form";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register: formRegister, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await register(data);
      navigate("/");
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