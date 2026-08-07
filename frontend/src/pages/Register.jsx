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
        navigate(`/workspaces/${result.joinedWorkspace.id}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 mb-4">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Register Page
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create an account to access your workspace
          </p>
        </div>

        {/* Form Element */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              {...formRegister("username", { required: true })}
              className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Email"
              {...formRegister("email", { required: true })}
              className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              {...formRegister("password", { required: true })}
              className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-xl py-3 px-4 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;