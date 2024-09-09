import React, { useState, useEffect } from 'react';
import { Tabs } from "@/components/ui/tabs";
import form1 from "@/assets/form1.png";
import form2 from "@/assets/form2.png";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "../../utils/apiService";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Auth = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    login: false,
    signup: false,
    confirmPassword: false,
  });
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      setIsLoading(true);
      try {
        await authApi.getCsrfToken();
        toast.success("CSRF token fetched successfully!", {
          duration: 5000,
          style: { border: '1px solid #4caf50' },
          icon: '🔒',
        });
      } catch (error) {
        toast.error("Failed to fetch CSRF token.", {
          duration: 5000,
          icon: '⚠️',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCsrfToken();
  }, []);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleLogin = async () => {
    if (!loginForm.email) {
      toast.error("Please enter a valid email address.", { duration: 5000 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(loginForm);
      toast.success("Login successful!", { duration: 5000 });
      navigate('/chat'); // Redirect to chat page after successful login
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Incorrect email or password.";
      toast.error(`Login failed: ${errorMessage}`, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.email) {
      toast.error("Please enter a valid email address.", { duration: 5000 });
      return;
    }

    if (!signupForm.firstName || !signupForm.lastName) {
      toast.error("First name and last name are required.", { duration: 5000 });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords do not match!", { duration: 5000 });
      return;
    }

    if (!validatePassword(signupForm.password)) {
      toast.error("Password must include at least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.", { duration: 5000 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.signup(signupForm);
      toast.success("Signup successful! Please log in.", { duration: 5000 });
      // Clear signup form
      setSignupForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // Switch to login tab
      setActiveTab("login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An account with this email already exists.";
      toast.error(`Signup failed: ${errorMessage}`, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      authApi.initiateGoogleAuth();
      toast.success("Redirecting to Google login...", { duration: 5000 });
    } catch (error) {
      toast.error("Google login failed.", { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <LoadingSpinner isLoading={isLoading} />
      <div className="w-full max-w-4xl bg-white text-opacity-90 shadow-2xl rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2">
          <div className="flex flex-col gap-6 p-6 lg:p-10">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Welcome</h1>
                <img
                  src={form1}
                  alt="chatImage"
                  className="h-16 sm:h-20 md:h-24"
                />
              </div>
              <p className="font-medium text-sm sm:text-base">
                Fill out the form below to chat with your friends!
              </p>
            </div>
            <div className="w-full max-w-md mx-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full bg-transparent rounded-none mb-5">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                  >
                    LogIn
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                  >
                    SignUp
                  </TabsTrigger>
                </TabsList>
                <div>
                  <TabsContent value="login" className="flex flex-col gap-4">
                    <Input
                      placeholder="Email"
                      type="email"
                      className="rounded-full p-4 sm:p-5"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        type={showPassword.login ? "text" : "password"}
                        className="rounded-full p-4 sm:p-5 pr-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('login')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.login ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <Button
                      className="rounded-full p-4 sm:p-5"
                      onClick={handleLogin}
                    >
                      LogIn
                    </Button>
                    <Button
                      className="rounded-full p-4 sm:p-5 bg-red-500 text-white"
                      onClick={handleGoogleLogin}
                    >
                      Login with Google
                    </Button>
                  </TabsContent>
                  <TabsContent value="signup" className="flex flex-col gap-4">
                    <Input
                      placeholder="First Name"
                      type="text"
                      className="rounded-full p-4 sm:p-5"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    />
                    <Input
                      placeholder="Last Name"
                      type="text"
                      className="rounded-full p-4 sm:p-5"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      className="rounded-full p-4 sm:p-5"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    />
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        type={showPassword.signup ? "text" : "password"}
                        className="rounded-full p-4 sm:p-5 pr-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('signup')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.signup ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Confirm Password"
                        type={showPassword.confirmPassword ? "text" : "password"}
                        className="rounded-full p-4 sm:p-5 pr-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <Button
                      className="rounded-full p-4 sm:p-5"
                      onClick={handleSignup}
                    >
                      SignUp
                    </Button>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
          <div className="hidden xl:flex justify-center items-center p-6 bg-gray-100">
            <img
              src={form2}
              alt="chatImage"
              className="max-h-[400px] w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;