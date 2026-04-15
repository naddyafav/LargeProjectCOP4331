import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'clouds_widget.dart';

const String _apiBase = 'http://104.236.41.135:5050/friends';
const Color _skyBlue = Color(0xFFACDFFA);
const Color _accentBlue = Color(0xFF7AA2E3);
const Color _cardBg = Color(0xFFF8F9FA);
const int _pageSize = 5;

class FriendsPage extends StatefulWidget {
  final String token;
  const FriendsPage({super.key, required this.token});

  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  List<Map<String, dynamic>> friends = [];
  int friendsTotal = 0;
  int friendsPage = 1;
  bool friendsLoading = true;
  String? friendsError;

  @override
  void initState() {
    super.initState();
    fetchFriends();
  }

  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${widget.token}',
      };

  Future<void> fetchFriends() async {
    setState(() => friendsLoading = true);
    try {
      final res = await http.get(
        Uri.parse('$_apiBase/list?page=$friendsPage&limit=$_pageSize'),
        headers: _authHeaders,
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200) {
        setState(() {
          friends = List<Map<String, dynamic>>.from(data['friends'] ?? []);
          friendsTotal = (data['total'] as num?)?.toInt() ?? 0;
          friendsError = null;
          friendsLoading = false;
        });
      } else {
        setState(() {
          friendsError = data['error'] ?? 'Failed to load friends.';
          friendsLoading = false;
        });
      }
    } catch (_) {
      setState(() {
        friendsError = 'Server error. Try again later.';
        friendsLoading = false;
      });
    }
  }

  Future<void> removeFriend(String username) async {
    try {
      final res = await http.delete(
        Uri.parse('$_apiBase/remove'),
        headers: _authHeaders,
        body: jsonEncode({'username': username}),
      );
      if (res.statusCode == 200) {
        setState(() {
          friends.removeWhere((f) => f['username'] == username);
          friendsTotal--;
        });
      } else {
        final data = jsonDecode(res.body);
        _showSnackBar(data['error'] ?? 'Could not remove friend.');
      }
    } catch (_) {
      _showSnackBar('Server error. Try again later.');
    }
  }

  void _showSnackBar(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  void handleFriendAdded(Map<String, dynamic> newFriend) {
    setState(() {
      if (friendsPage == 1 && friends.length < _pageSize) {
        friends.add(newFriend);
      }
      friendsTotal++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _skyBlue,
      appBar: AppBar(
        backgroundColor: _skyBlue,
        elevation: 0,
        centerTitle: true,
        title: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
          decoration: BoxDecoration(
            color: _cardBg,
            border: Border.all(color: _accentBlue, width: 3),
            borderRadius: BorderRadius.circular(30),
          ),
          child: const Text(
            'Friends',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ),
      ),
      body: Stack(
        children: [
          const Positioned.fill(child: CloudsBackground()),
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildCurrentFriendsCard(),
                const SizedBox(height: 16),
                _RecommendedFriendsCard(
                  token: widget.token,
                  onAdd: handleFriendAdded,
                ),
                const SizedBox(height: 16),
                _SearchFriendsCard(
                  token: widget.token,
                  onAdd: handleFriendAdded,
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentFriendsCard() {
    final totalPages = (friendsTotal / _pageSize).ceil();

    return _AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text(
              'Current Friends',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _accentBlue,
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (friendsLoading)
            const Center(child: CircularProgressIndicator())
          else if (friendsError != null)
            Text(friendsError!, style: const TextStyle(color: Colors.red))
          else if (friends.isEmpty)
            const Text(
              'No friends yet. Search for users to add!',
              style: TextStyle(color: Colors.grey),
            )
          else ...[
            ...friends.map(
              (f) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${f['firstName'] ?? ''} ${f['lastName'] ?? ''}',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          Text(
                            '@${f['username'] ?? ''}',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () => removeFriend(f['username'] as String),
                      style: TextButton.styleFrom(foregroundColor: Colors.red),
                      child: const Text('Remove'),
                    ),
                  ],
                ),
              ),
            ),
            if (totalPages > 1)
              _PaginationRow(
                page: friendsPage,
                totalPages: totalPages,
                onPageChange: (p) {
                  setState(() => friendsPage = p);
                  fetchFriends();
                },
              ),
          ],
        ],
      ),
    );
  }
}

// ── Recommended Friends Card ──────────────────────────────────────────────────

class _RecommendedFriendsCard extends StatefulWidget {
  final String token;
  final void Function(Map<String, dynamic>) onAdd;
  const _RecommendedFriendsCard({required this.token, required this.onAdd});

  @override
  State<_RecommendedFriendsCard> createState() =>
      _RecommendedFriendsCardState();
}

class _RecommendedFriendsCardState extends State<_RecommendedFriendsCard> {
  List<Map<String, dynamic>> users = [];
  int total = 0;
  int page = 1;
  bool loading = true;
  String? error;
  String? message;
  String? adding;

  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${widget.token}',
      };

  @override
  void initState() {
    super.initState();
    fetchRecommended();
  }

  Future<void> fetchRecommended() async {
    setState(() => loading = true);
    try {
      final res = await http.get(
        Uri.parse('$_apiBase/recommended?page=$page&limit=$_pageSize'),
        headers: _authHeaders,
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200) {
        setState(() {
          users = List<Map<String, dynamic>>.from(data['results'] ?? []);
          total = (data['total'] as num?)?.toInt() ?? 0;
          message = data['message'] as String?;
          error = null;
          loading = false;
        });
      } else {
        setState(() {
          error = data['error'] ?? 'Failed to load recommendations.';
          loading = false;
        });
      }
    } catch (_) {
      setState(() {
        error = 'Server error. Try again later.';
        loading = false;
      });
    }
  }

  Future<void> handleAdd(Map<String, dynamic> user) async {
    setState(() => adding = user['username'] as String);
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/add'),
        headers: _authHeaders,
        body: jsonEncode({'username': user['username']}),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        widget.onAdd(user);
        setState(() => page = 1);
        fetchRecommended();
      } else {
        final data = jsonDecode(res.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(data['error'] ?? 'Could not add friend.')),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Server error. Try again later.')),
        );
      }
    }
    if (mounted) setState(() => adding = null);
  }

  @override
  Widget build(BuildContext context) {
    final totalPages = (total / _pageSize).ceil();

    return _AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text(
              'Recommended Friends',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _accentBlue,
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (loading)
            const Center(child: CircularProgressIndicator())
          else if (error != null)
            Text(error!, style: const TextStyle(color: Colors.red))
          else if (users.isEmpty)
            Text(
              message ?? 'No recommendations available.',
              style: const TextStyle(color: Colors.grey),
            )
          else ...[
            ...users.map(
              (u) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${u['firstName'] ?? ''} ${u['lastName'] ?? ''}',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          Text(
                            '@${u['username'] ?? ''}',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed:
                          adding == u['username'] ? null : () => handleAdd(u),
                      child: Text(
                        adding == u['username'] ? 'Adding...' : 'Add',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (totalPages > 1)
              _PaginationRow(
                page: page,
                totalPages: totalPages,
                onPageChange: (p) {
                  setState(() => page = p);
                  fetchRecommended();
                },
              ),
          ],
        ],
      ),
    );
  }
}

// ── Search Friends Card ───────────────────────────────────────────────────────

class _SearchFriendsCard extends StatefulWidget {
  final String token;
  final void Function(Map<String, dynamic>) onAdd;
  const _SearchFriendsCard({required this.token, required this.onAdd});

  @override
  State<_SearchFriendsCard> createState() => _SearchFriendsCardState();
}

class _SearchFriendsCardState extends State<_SearchFriendsCard> {
  final TextEditingController _queryController = TextEditingController();
  List<Map<String, dynamic>> results = [];
  int total = 0;
  int page = 1;
  bool searched = false;
  bool loading = false;
  String? error;
  String? adding;

  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${widget.token}',
      };

  Future<void> fetchResults(int pageNum, String query) async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final encoded = Uri.encodeComponent(query);
      final res = await http.get(
        Uri.parse('$_apiBase/search?q=$encoded&page=$pageNum&limit=$_pageSize'),
        headers: _authHeaders,
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200) {
        setState(() {
          results = List<Map<String, dynamic>>.from(data['results'] ?? []);
          total = (data['total'] as num?)?.toInt() ?? 0;
          searched = true;
          loading = false;
        });
      } else {
        setState(() {
          error = data['error'] ?? 'Search failed.';
          loading = false;
        });
      }
    } catch (_) {
      setState(() {
        error = 'Server error. Try again later.';
        loading = false;
      });
    }
  }

  void handleSearch() {
    final q = _queryController.text.trim();
    if (q.isEmpty) return;
    setState(() => page = 1);
    fetchResults(1, q);
  }

  Future<void> handleAdd(Map<String, dynamic> user) async {
    setState(() => adding = user['username'] as String);
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/add'),
        headers: _authHeaders,
        body: jsonEncode({'username': user['username']}),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        widget.onAdd(user);
        fetchResults(page, _queryController.text.trim());
      } else {
        final data = jsonDecode(res.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(data['error'] ?? 'Could not add friend.')),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Server error. Try again later.')),
        );
      }
    }
    if (mounted) setState(() => adding = null);
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final totalPages = (total / _pageSize).ceil();

    return _AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text(
              'Search Friends',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _accentBlue,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _queryController,
                  decoration: const InputDecoration(
                    hintText: 'Search by name or username...',
                    border: OutlineInputBorder(),
                    isDense: true,
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  onSubmitted: (_) => handleSearch(),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: loading ? null : handleSearch,
                style: ElevatedButton.styleFrom(backgroundColor: _accentBlue),
                child: Text(
                  loading ? '...' : 'Search',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          if (error != null) ...[
            const SizedBox(height: 8),
            Text(error!, style: const TextStyle(color: Colors.red)),
          ],
          if (searched && results.isEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'No users found for "${_queryController.text}".',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
          if (results.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...results.map(
              (u) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${u['firstName'] ?? ''} ${u['lastName'] ?? ''}',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          Text(
                            '@${u['username'] ?? ''}',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed:
                          adding == u['username'] ? null : () => handleAdd(u),
                      child: Text(
                        adding == u['username'] ? 'Adding...' : 'Add',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (totalPages > 1)
              _PaginationRow(
                page: page,
                totalPages: totalPages,
                onPageChange: (p) {
                  setState(() => page = p);
                  fetchResults(p, _queryController.text.trim());
                },
              ),
          ],
        ],
      ),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _AppCard extends StatelessWidget {
  final Widget child;
  const _AppCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _cardBg,
        border: Border.all(color: _accentBlue, width: 3),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: child,
    );
  }
}

class _PaginationRow extends StatelessWidget {
  final int page;
  final int totalPages;
  final void Function(int) onPageChange;
  const _PaginationRow({
    required this.page,
    required this.totalPages,
    required this.onPageChange,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          onPressed: page > 1 ? () => onPageChange(page - 1) : null,
          icon: const Icon(Icons.chevron_left),
        ),
        Text('$page / $totalPages', style: const TextStyle(fontSize: 14)),
        IconButton(
          onPressed: page < totalPages ? () => onPageChange(page + 1) : null,
          icon: const Icon(Icons.chevron_right),
        ),
      ],
    );
  }
}
