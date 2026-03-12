import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from 'react-router-dom';
import loginImage from '../assets/login prop.png';
import toast from 'react-hot-toast';

function LoginPage() {

  const { login, isLoggingin } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })



  const validateForm = () => {

    if (!formData.email.trim()) {
      toast.error("Enter your email address");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }   //for checking the validity of the email..

    if (!formData.password.trim()) {
      toast.error("Enter a password");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password too short!!");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid = validateForm();

    if (valid) {
      const success = await login(formData);
      if (success) {
        navigate('/');
      }
    }
  }

  return (
    <div className=' min-h-screen grid lg:grid-cols-2 max-w-7xl mx-auto mt-[-100px] gap-0'>
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-4 sm:p-4 lg:p-4 animate-slide-in-left">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className='space-y-4 animate-slide-up delay-100' autoComplete="new-password">

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email-Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/70" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 `}
                  placeholder="email@gmial.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
            </div>


            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='btn btn-primary w-full'
              disabled={isLoggingin} // prevent muktiple tab while signg in 
            >

              {isLoggingin ? <Loader2 className=' size-5 animate-spin' /> : "Log In"}

            </button>


          </form>

          <div className='text-center mt-6 animate-fade-in delay-200'>
            <p className='text-base-content/60'>
              New to Chattyfy? {" "}<Link to="/signup" className="link link-primary"> Sign up </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}
      <div className="hidden lg:flex flex-col items-center justify-center p-4 sm:p-4 lg:p-4 animate-slide-in-right">
        <img
          src={loginImage}
          alt="Sign up illustration"
          className="w-[85%] h-[85%] object-contain mx-auto rounded-[60px] animate-float  mt-[50px]"
        />
      </div>
    </div>
  )
}

export default LoginPage