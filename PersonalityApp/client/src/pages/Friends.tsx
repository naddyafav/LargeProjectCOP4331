import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

const API_BASE = "http://104.236.41.135:5050/friends";
const PAGE_SIZE = 5;

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

interface PaginationProps {
  total: number;
  page: number;
  onPageChange: (p: number) => void;
}

function Pagination({ total, page, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
      <span className="page-info">{page} / {totalPages}</span>
      <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
}

interface Friend {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  personalityType?: string;
}

interface RecommendedUser extends Friend {}

// ── Current Friends Card ─────────────────────────────────────────────────────

interface CurrentFriendsCardProps {
  friends: Friend[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  onPageChange: (p: number) => void;
  onRemove: (friend: Friend) => void;
}

function CurrentFriendsCard({ friends, total, loading, error, page, onPageChange, onRemove }: CurrentFriendsCardProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(friend: Friend) {
    setRemoving(friend.username);
    try {
      const res = await fetch(`${API_BASE}/remove`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ username: friend.username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove friend.");
      onRemove(friend);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="card">
      <h2 className="page-header" style={{ textAlign: "center" }}>Current Friends</h2>

      {loading && <p className="card-status">Loading...</p>}
      {error && <p className="card-status card-error">{error}</p>}

      {!loading && !error && friends.length === 0 && (
        <p className="card-status">No friends yet. Search for users to add!</p>
      )}

      {!loading && !error && friends.length > 0 && (
        <>
          <ul className="user-list">
            {friends.map((f) => (
              <li key={f._id} className="user-row">
                <span className="user-name">
                  {f.firstName} {f.lastName}{" "}
                  <span className="user-handle">@{f.username}</span>
                  {f.personalityType && (
                    <span className="user-personality"> · {f.personalityType}</span>
                  )}
                </span>
                <button
                  className="button button-danger button-action"
                  disabled={removing === f.username}
                  onClick={() => handleRemove(f)}
                >
                  {removing === f.username ? "Removing..." : "Remove"}
                </button>
              </li>
            ))}
          </ul>
          <Pagination total={total} page={page} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}

// ── Recommended Friends Card ─────────────────────────────────────────────────

interface RecommendedFriendsCardProps {
  onAdd: (friend: Friend) => void;
}

function RecommendedFriendsCard({ onAdd }: RecommendedFriendsCardProps) {
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchRecommended() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/recommended?page=${page}&limit=${PAGE_SIZE}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load recommendations.");
        if (data.message) setMessage(data.message);
        setUsers(data.results || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommended();
  }, [page]);

  async function handleAdd(user: RecommendedUser) {
    setAdding(user.username);
    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username: user.username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add friend.");
      onAdd(user);
      // Re-fetch current page to fill the gap left by the removed user
      setPage(1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="card">
      <h2 className="page-header" style={{ textAlign: "center" }}>Recommended Friends</h2>

      {loading && <p className="card-status">Loading...</p>}
      {error && <p className="card-status card-error">{error}</p>}

      {!loading && !error && message && users.length === 0 && (
        <p className="card-status card-hint">{message}</p>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <ul className="user-list">
            {users.map((u) => (
              <li key={u._id} className="user-row">
                <span className="user-name">
                  {u.firstName} {u.lastName}{" "}
                  <span className="user-handle">@{u.username}</span>
                  {u.personalityType && (
                    <span className="user-personality"> · {u.personalityType}</span>
                  )}
                </span>
                <button
                  className="button button-action"
                  disabled={adding === u.username}
                  onClick={() => handleAdd(u)}
                >
                  {adding === u.username ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
          <Pagination total={total} page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ── Search Friends Card ──────────────────────────────────────────────────────

interface SearchFriendsCardProps {
  onAdd: (friend: Friend) => void;
}

function SearchFriendsCard({ onAdd }: SearchFriendsCardProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Friend[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function fetchResults(pageNum: number, searchQuery: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=${PAGE_SIZE}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []);
      setTotal(data.total || 0);
      setSearched(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setPage(1);
    fetchResults(1, trimmed);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchResults(newPage, query.trim());
  }

  async function handleAdd(user: Friend) {
    setAdding(user.username);
    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username: user.username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add friend.");
      onAdd(user);
      // Re-fetch current page to fill the gap
      fetchResults(page, query.trim());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="card">
      <h2 className="page-header" style={{ textAlign: "center" }}>Search Friends</h2>

      <div className="search-col">
        <input
          type="text"
          placeholder="Search by name or username..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="button" onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="card-status card-error">{error}</p>}

      {searched && results.length === 0 && (
        <p className="card-status">No users found for "{query}".</p>
      )}

      {results.length > 0 && (
        <>
          <ul className="user-list">
            {results.map((u) => (
              <li key={u._id} className="user-row">
                <span className="user-name">
                  {u.firstName} {u.lastName}{" "}
                  <span className="user-handle">@{u.username}</span>
                  {u.personalityType && (
                    <span className="user-personality"> · {u.personalityType}</span>
                  )}
                </span>
                <button
                  className="button button-action"
                  disabled={adding === u.username}
                  onClick={() => handleAdd(u)}
                >
                  {adding === u.username ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
          <Pagination total={total} page={page} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsTotal, setFriendsTotal] = useState(0);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [friendsPage, setFriendsPage] = useState(1);

  useEffect(() => {
    async function fetchFriends() {
      setFriendsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/list?page=${friendsPage}&limit=${PAGE_SIZE}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load friends.");
        setFriends(data.friends);
        setFriendsTotal(data.total);
      } catch (err: any) {
        setFriendsError(err.message);
      } finally {
        setFriendsLoading(false);
      }
    }
    fetchFriends();
  }, [friendsPage]);

  function handleFriendAdded(newFriend: Friend) {
    // Optimistically add to local list if we're on page 1 and there's room
    if (friendsPage === 1 && friends.length < PAGE_SIZE) {
      setFriends((prev) => [...prev, newFriend]);
    }
    setFriendsTotal((prev) => prev + 1);
  }

  function handleFriendRemoved(removedFriend: Friend) {
    setFriends((prev) => prev.filter((f) => f._id !== removedFriend._id));
    setFriendsTotal((prev) => prev - 1);
  }

  return (
    <div className="page-center page-sky" style={{ flexDirection: "column" }}>
      <Clouds />

      <div style={{ textAlign: "center", marginBottom: "20px", zIndex: 1 }}>
        <h1
          className="page-title"
          style={{
            display: "inline-block",
            backgroundColor: "#f8f9fa",
            border: "6px solid #7aa2e3",
            borderRadius: "50px",
            padding: "10px 32px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            margin: 0,
          }}
        >
          Friends
        </h1>
      </div>

      <div className="card-row">
        <CurrentFriendsCard
          friends={friends}
          total={friendsTotal}
          loading={friendsLoading}
          error={friendsError}
          page={friendsPage}
          onPageChange={setFriendsPage}
          onRemove={handleFriendRemoved}
        />
        <RecommendedFriendsCard onAdd={handleFriendAdded} />
        <SearchFriendsCard onAdd={handleFriendAdded} />
      </div>

      <div style={{ marginTop: "20px", zIndex: "1"}}>
        <button onClick={() => navigate("/home")} className="button">
          Home
        </button>
      </div>
    </div>
  );
}