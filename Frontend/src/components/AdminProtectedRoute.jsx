import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const AdminProtectedRoute = ({ children }) => {
  const { user, loading, setOpenLogin } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setOpenLogin(true);
    }
  }, [user, loading, setOpenLogin]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin text-[#e5007d]" size={44} />
        <p className="text-zinc-400 font-medium animate-pulse text-sm">Verifying administrator session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
