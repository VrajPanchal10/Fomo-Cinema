import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { Loader2, Search, User } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setErrorMsg(error.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const name = u.name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const phone = u.phone?.toLowerCase() || "";
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#e5007d]" size={48} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-10 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-2xl max-w-md mx-auto p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-2">Error Loading Users</h2>
        <p className="text-sm font-semibold">{errorMsg}</p>
        <p className="text-xs text-zinc-500 mt-4">Please verify your administrator session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Registered Users</h1>
        <p className="text-zinc-400 mt-1">Read-only index of registered accounts on FoMo Cinema.</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 text-zinc-500" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name, Email, or Phone..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#e5007d] transition"
        />
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Account Role</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-zinc-500">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-zinc-900/20 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold uppercase text-xs">
                        {userItem.name ? userItem.name[0] : <User size={14} />}
                      </div>
                      <span className="font-bold text-white truncate max-w-[180px]">
                        {userItem.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 truncate max-w-[200px]">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{userItem.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        userItem.role === "admin" ? "text-amber-400 bg-amber-400/10 border border-amber-400/20" : "text-zinc-400 bg-zinc-800/40 border border-zinc-700/50"
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {new Date(userItem.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
