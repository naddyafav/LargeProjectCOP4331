import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'cloud_profiles.dart';
import 'login_page.dart';
import 'quiz_page.dart';
import 'friends_page.dart';
import 'clouds_widget.dart';

const String _apiBase = 'http://104.236.41.135:5050';
const Color _skyBlue = Color(0xFFACDFFA);
const Color _accentBlue = Color(0xFF7AA2E3);
const Color _cardBg = Color(0xFFF8F9FA);

class HomePage extends StatefulWidget {
  final Map user;
  final String token;

  const HomePage({super.key, required this.user, required this.token});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  Map? userData;
  CloudProfile? cloudProfile;
  String error = '';
  bool loading = true;

  @override
  void initState() {
    super.initState();
    userData = widget.user;
    fetchUser();
  }

  Future<void> fetchUser() async {
    setState(() => loading = true);
    try {
      final res = await http.get(
        Uri.parse('$_apiBase/user'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200) {
        setState(() {
          userData = data;
          final type = data['personalityType'] as String?;
          cloudProfile = type != null ? getProfileByName(type) : null;
          error = '';
          loading = false;
        });
      } else {
        setState(() {
          error = data['error'] ?? 'Failed to fetch user.';
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

  void handleLogout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginPage()),
    );
  }

  void goToQuiz() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => QuizPage(token: widget.token)),
    ).then((_) => fetchUser());
  }

  void goToFriends() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => FriendsPage(token: widget.token)),
    ).then((_) => fetchUser());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _skyBlue,
      body: Stack(
        children: [
          const Positioned.fill(child: CloudsBackground()),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
            children: [
              const SizedBox(height: 12),
              _titleBadge('Welcome, ${userData?['firstName'] ?? ''}'),
              const SizedBox(height: 20),
              _buildProfileCard(),
              const SizedBox(height: 16),
              _buildPersonalityCard(),
              const SizedBox(height: 16),
              _buildFriendsCard(),
              const SizedBox(height: 24),
            ],
          ),
        ),
          ),
        ],
      ),
    );
  }

  Widget _titleBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 10),
      decoration: BoxDecoration(
        color: _cardBg,
        border: Border.all(color: _accentBlue, width: 4),
        borderRadius: BorderRadius.circular(50),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: Text(
        text,
        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildProfileCard() {
    return _AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text(
              'Profile',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _accentBlue),
            ),
          ),
          const SizedBox(height: 16),
          _profileRow('First Name', userData?['firstName'] ?? ''),
          _profileRow('Last Name', userData?['lastName'] ?? ''),
          _profileRow('Username', userData?['username'] ?? ''),
          _profileRow('Email', userData?['email'] ?? ''),
          if (error.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(error, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 16),
          _AppButton(label: 'Logout', onPressed: handleLogout),
        ],
      ),
    );
  }

  Widget _profileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(color: Colors.black87, fontSize: 15),
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }

  Widget _buildPersonalityCard() {
    if (loading) {
      return const _AppCard(
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (cloudProfile == null) {
      return _AppCard(
        child: Column(
          children: [
            const Text(
              'No Quiz Results Yet.',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _accentBlue),
            ),
            const SizedBox(height: 16),
            _AppButton(label: 'Take Quiz', onPressed: goToQuiz),
          ],
        ),
      );
    }

    final p = cloudProfile!;
    return _AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Column(
              children: [
                Text(p.emoji, style: const TextStyle(fontSize: 52)),
                const SizedBox(height: 4),
                Text(
                  p.name,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: _accentBlue,
                  ),
                ),
                Text(
                  p.altitude,
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            p.description,
            style: const TextStyle(color: Color(0xFF444444), height: 1.7),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: p.traits
                .map(
                  (trait) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _accentBlue.withValues(alpha: 0.15),
                      border: Border.all(color: _accentBlue),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      trait,
                      style: const TextStyle(color: _accentBlue, fontSize: 13),
                    ),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 20),
          _AppButton(label: 'Retake Quiz', onPressed: goToQuiz),
        ],
      ),
    );
  }

  Widget _buildFriendsCard() {
    final friends = (userData?['friends'] as List?) ?? [];

    return _AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text(
              'Current Friends',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _accentBlue),
            ),
          ),
          const SizedBox(height: 12),
          if (friends.isEmpty)
            const Text('No Friends Yet.', style: TextStyle(color: Colors.grey))
          else
            Column(
              children: friends
                  .map<Widget>(
                    (f) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.person, color: _accentBlue, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            f['username'] ?? '',
                            style: const TextStyle(fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(),
            ),
          const SizedBox(height: 16),
          _AppButton(label: 'Find Friends', onPressed: goToFriends),
        ],
      ),
    );
  }
}

// ── Shared card widget ────────────────────────────────────────────────────────

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
        border: Border.all(color: _accentBlue, width: 4),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: child,
    );
  }
}

// ── Shared button widget ──────────────────────────────────────────────────────

class _AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  const _AppButton({required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: _accentBlue,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 15)),
      ),
    );
  }
}
