import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

const API_BASE = "http://104.236.41.135:5050/friends";
const PAGE_SIZE = 10;

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── Pagination helper ────────────────────────────────────────────────────────

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
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>
      <span className="page-info">
        {page} / {totalPages}
      </span>
      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Friend {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface RecommendedUser extends Friend {
  personalityType?: string;
}

// ── Current Friends Card ─────────────────────────────────────────────────────

function CurrentFriendsCard() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch(`${API_BASE}/list`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load friends.");
        setFriends(data.friends);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFriends();
  }, []);

  const paginated = friends.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card">
      <h2 className="page-header">Current Friends</h2>

      {loading && <p className="card-status">Loading...</p>}
      {error && <p className="card-status card-error">{error}</p>}

      {!loading && !error && friends.length === 0 && (
        <p className="card-status">No friends yet. Search for users to add!</p>
      )}

      {!loading && !error && friends.length > 0 && (
        <>
          <ul className="user-list">
            {paginated.map((f) => (
              <li key={f._id} className="user-row">
                <span className="user-name">
                  {f.firstName} {f.lastName}{" "}
                  <span className="user-handle">@{f.username}</span>
                </span>
                <button
                  className="button button-danger button-sm"
                  onClick={() => {
                    // Placeholder — /friends/delete not yet implemented
                    alert(`Remove friend: ${f.username} (endpoint pending)`);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <Pagination total={friends.length} page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ── Recommended Friends Card ─────────────────────────────────────────────────

function RecommendedFriendsCard() {
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const res = await fetch(`${API_BASE}/recommended`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load recommendations.");
        if (data.message) setMessage(data.message);
        setUsers(data.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommended();
  }, []);

  async function handleAdd(username: string) {
    setAdding(username);
    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add friend.");
      // Remove from recommended list after adding
      setUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(null);
    }
  }

  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card">
      <h2 className="page-header">Recommended Friends</h2>

      {loading && <p className="card-status">Loading...</p>}
      {error && <p className="card-status card-error">{error}</p>}

      {!loading && !error && message && users.length === 0 && (
        <p className="card-status card-hint">{message}</p>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <ul className="user-list">
            {paginated.map((u) => (
              <li key={u._id} className="user-row">
                <span className="user-name">
                  {u.firstName} {u.lastName}{" "}
                  <span className="user-handle">@{u.username}</span>
                </span>
                <button
                  className="button button-sm"
                  disabled={adding === u.username}
                  onClick={() => handleAdd(u.username)}
                >
                  {adding === u.username ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
          <Pagination total={users.length} page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ── Search Friends Card ──────────────────────────────────────────────────────

function SearchFriendsCard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Friend[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    setPage(1);

    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(trimmed)}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []);
      setSearched(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(username: string) {
    setAdding(username);
    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add friend.");
      // Remove from search results after adding
      setResults((prev) => prev.filter((u) => u.username !== username));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(null);
    }
  }

  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card">
      <h2 className="page-header">Search Friends</h2>

      <div className="search-row">
        <input
          type="text"
          placeholder="Search by name or username..."
          className="input"
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
            {paginated.map((u) => (
              <li key={u._id} className="user-row">
                <span className="user-name">
                  {u.firstName} {u.lastName}{" "}
                  <span className="user-handle">@{u.username}</span>
                </span>
                <button
                  className="button button-sm"
                  disabled={adding === u.username}
                  onClick={() => handleAdd(u.username)}
                >
                  {adding === u.username ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
          <Pagination total={results.length} page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Friends() {
  const navigate = useNavigate();
  const goToHome = () => navigate("/home");

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
        <CurrentFriendsCard />
        <RecommendedFriendsCard />
        <SearchFriendsCard />
      </div>

      <div style={{ marginTop: "20px", zIndex: "1"}}>
        <button onClick={goToHome} className="button">
          Home
        </button>
      </div>
    </div>
  );
}
