"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { authService } from "@/services/auth-service";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      setToken(response.access_token);

      const user = await authService.getMe(response.access_token);
      setUser(user);

      toast.success("Signed in successfully");
      router.push("/hosted-zones");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#232F3E" }}>
      {/* AWS Top bar */}
      <div className="bg-aws-navy px-6 py-3 flex items-center gap-3 border-b border-white/10">
        <svg width="32" height="32" viewBox="0 0 60 36" fill="none">
          <path d="M17.2 14.6c-.5 1.5-.8 3.1-.8 4.8 0 1.2.1 2.3.4 3.4l-5.7 5.7c-1.2-2.8-1.9-5.9-1.9-9.1 0-4 1-7.7 2.8-11l5.2 6.2z" fill="#FF9900"/>
          <path d="M30 6.8C20.6 6.8 13 14.4 13 23.8s7.6 17 17 17 17-7.6 17-17S39.4 6.8 30 6.8zm0 30c-7.2 0-13-5.8-13-13s5.8-13 13-13 13 5.8 13 13-5.8 13-13 13z" fill="#FF9900"/>
        </svg>
        <span className="text-white font-medium text-sm">AWS Management Console</span>
      </div>

      {/* Login box */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-aws-gray-200">
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-aws-orange rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">aws</span>
                  </div>
                  <span className="text-aws-navy font-semibold text-lg">AWS Console</span>
                </div>
              </div>
              <h1 className="text-center text-aws-gray-800 font-medium text-base">
                Sign in
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <p className="text-aws-red text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full border border-aws-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
                    placeholder="password123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-aws-gray-500 hover:text-aws-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-aws-red text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-aws-primary flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign in
              </button>

              <div className="mt-3 p-3 bg-aws-gray-50 rounded border border-aws-gray-200 text-xs text-aws-gray-600">
                <p className="font-semibold mb-1">Demo credentials</p>
                <p>Email: admin@example.com</p>
                <p>Password: password123</p>
              </div>
            </form>
          </div>

          <p className="text-center text-aws-gray-400 text-xs mt-6">
            © 2024, Amazon Web Services, Inc. or its affiliates
          </p>
        </div>
      </div>
    </div>
  );
}
