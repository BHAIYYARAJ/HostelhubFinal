import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppScreen } from "@/components/mobile/AppScreen";
import { AppButton, Segmented } from "@/components/mobile/MobileKit";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "owner">("student");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }
    setBusy(true);
    if (mode === "login") {
      const { error } = await login(email.trim(), password);
      setBusy(false);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Welcome back");
      navigate("/");
      return;
    }

    if (name.trim().length < 2) {
      setBusy(false);
      toast.error("Please enter your name");
      return;
    }
    const { error, needsConfirmation } = await signup(name.trim(), email.trim(), password, role);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (needsConfirmation) {
      toast.success("Check your inbox to confirm your email");
      navigate("/login");
      return;
    }
    toast.success("Account created");
    navigate(role === "owner" ? "/owner" : "/");
  };

  return (
    <AppScreen withTabBar={false} canvas={false} className="flex min-h-[100dvh] flex-col px-6">
      <div className="pt-safe" />
      <div className="pt-14">
        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-primary shadow-app-float">
          <Building2 className="h-7 w-7 text-primary-foreground" strokeWidth={2.4} />
        </span>
        <h1 className="mt-6 text-[30px] font-extrabold leading-tight tracking-tight text-foreground">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {mode === "login"
            ? "Sign in to continue booking your stay."
            : "Join HostelHub to book verified hostels near you."}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {mode === "signup" && (
          <>
            <Segmented
              value={role}
              onChange={setRole}
              options={[
                { value: "student", label: "I'm a student" },
                { value: "owner", label: "I'm an owner" },
              ]}
            />
            <Input value={name} onChange={setName} placeholder="Full name" autoComplete="name" />
          </>
        )}
        <Input
          value={email}
          onChange={setEmail}
          placeholder="Email address"
          type="email"
          autoComplete="email"
        />
        <Input
          value={password}
          onChange={setPassword}
          placeholder="Password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      <div className="mt-6">
        <AppButton onClick={submit} disabled={busy}>
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : mode === "login" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </AppButton>
      </div>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        {mode === "login" ? (
          <>
            New to HostelHub?{" "}
            <Link to="/signup" className="font-bold text-primary">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-primary">
              Sign in
            </Link>
          </>
        )}
      </p>

      <div className="flex-1" />
      <Link to="/" className="pb-[max(1.5rem,var(--safe-bottom))] text-center text-[13px] font-semibold text-muted-foreground">
        Continue browsing
      </Link>
    </AppScreen>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      value={value}
      type={type}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-14 w-full rounded-2xl bg-muted px-4 text-[15px] font-medium outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
    />
  );
}
