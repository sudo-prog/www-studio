import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/auth-web";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";

interface PasswordLoginProps {
  onSuccess?: () => void;
}

export function PasswordLogin({ onSuccess }: PasswordLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { passwordSet, setPassword: setOwnerPassword, loginWithPassword, hasSavedPassword, clearSavedPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const success = passwordSet
        ? await loginWithPassword(password)
        : await setOwnerPassword(password);
      if (success) {
        toast({
          title: passwordSet ? "Logged in" : "Password created",
          description: "Password saved for future sessions.",
        });
        onSuccess?.();
      } else {
        setError(passwordSet ? "Invalid password." : "Could not set password. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {hasSavedPassword && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-xs text-green-600 dark:text-green-400 flex-1">
            Saved password detected — auto-login active
          </p>
          <button
            onClick={clearSavedPassword}
            className="text-[10px] text-muted-foreground hover:text-foreground underline"
          >
            Clear
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={passwordSet ? "Enter password" : "Create a password (8+ chars)"}
            className="pl-9 pr-9"
            disabled={loading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={!password.trim() || loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {passwordSet ? "Logging in..." : "Setting password..."}
            </>
          ) : (
            <>
              {passwordSet ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login with Password
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Set password
                </>
              )}
            </>
          )}
        </Button>
      </form>

      <p className="text-[10px] text-muted-foreground text-center">
        Password is stored on the server and saved locally for auto-login on next visit.
      </p>
    </div>
  );
}
