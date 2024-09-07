import { Tabs } from "@/components/ui/tabs";
import form1 from "@/assets/form1.png";
import form2 from "@/assets/form2.png";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "../../utils/apiService"; // Assuming authApi is exported correctly

const Auth = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await authApi.getCsrfToken();
        console.log("CSRF token fetched successfully");
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleLogin = async () => {
    console.log("Attempting login with email:", email);
    try {
      const response = await authApi.login({ email, password });
      console.log("Login response:", response);
      alert("Login successful!");
      // Handle successful login (e.g., store token, redirect)
    } catch (error) {
      console.error("Login failed", error);
      if (error.response) {
        console.log("Error response:", error.response.data);
        alert(
          `Login failed: ${error.response.data.message || "Please try again."}`
        );
      } else if (error.request) {
        console.log("Error request:", error.request);
        alert("No response from server. Please try again later.");
      } else {
        console.log("Error", error.message);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleSignup = async () => {
    console.log("Attempting signup with email:", email);
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await authApi.signup({
        firstName,
        lastName,
        email,
        password,
      });
      console.log("Signup response:", response);
      alert("Signup successful! You can now login.");
    } catch (error) {
      console.error("Signup failed", error);
      if (error.response) {
        console.log("Error response:", error.response.data);
        alert(
          `Signup failed: ${error.response.data.message || "Please try again."}`
        );
      } else if (error.request) {
        console.log("Error request:", error.request);
        alert("No response from server. Please try again later.");
      } else {
        console.log("Error", error.message);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    authApi.initiateGoogleAuth();
  }

    

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white text-opacity-90 shadow-2xl rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2">
          <div className="flex flex-col gap-6 p-6 lg:p-10">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  {" "}
                  Welcome
                </h1>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      className="rounded-full p-4 sm:p-5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      placeholder="Last Name"
                      type="text"
                      className="rounded-full p-4 sm:p-5"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      className="rounded-full p-4 sm:p-5"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      className="rounded-full p-4 sm:p-5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input
                      placeholder="Confirm Password"
                      type="password"
                      className="rounded-full p-4 sm:p-5"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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
