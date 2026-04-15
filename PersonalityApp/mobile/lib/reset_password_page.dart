import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'login_page.dart';
import 'clouds_widget.dart';

const Color _skyBlue = Color(0xFFACDFFA);
const Color _accentBlue = Color(0xFF7AA2E3);
const Color _cardBg = Color(0xFFF8F9FA);

class ResetPasswordPage extends StatefulWidget {
  /// Optional token passed via deep link; if null the user enters it manually.
  final String? token;
  const ResetPasswordPage({super.key, this.token});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  late final TextEditingController _tokenController;
  final TextEditingController _passwordController = TextEditingController();

  String message = '';
  String error = '';
  bool loading = false;
  bool hidePassword = true;

  @override
  void initState() {
    super.initState();
    _tokenController = TextEditingController(text: widget.token ?? '');
  }

  Future<void> handleSubmit() async {
    final token = _tokenController.text.trim();
    final password = _passwordController.text.trim();

    if (token.isEmpty || password.isEmpty) {
      setState(() => error = 'Please fill in all fields.');
      return;
    }

    setState(() {
      loading = true;
      message = '';
      error = '';
    });

    try {
      final res = await http.post(
        Uri.parse('http://104.236.41.135:5050/password/reset'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token, 'newPassword': password}),
      );
      final data = jsonDecode(res.body);

      if (res.statusCode == 200) {
        setState(() {
          message = data['message'] ?? 'Password reset successfully.';
          loading = false;
        });
        await Future.delayed(const Duration(seconds: 3));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const LoginPage()),
          );
        }
      } else {
        setState(() {
          error = data['error'] ?? 'Password reset failed.';
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

  @override
  void dispose() {
    _tokenController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _skyBlue,
      body: Stack(
        children: [
          const Positioned.fill(child: CloudsBackground()),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: _cardBg,
                    border: Border.all(color: _accentBlue, width: 4),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Reset Password',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: _accentBlue,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Paste the token from your reset email link below.',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      // Token field — hidden if passed via deep link
                      if (widget.token == null || widget.token!.isEmpty) ...[
                        TextField(
                          controller: _tokenController,
                          decoration: const InputDecoration(
                            labelText: 'Reset Token',
                            border: OutlineInputBorder(),
                            filled: true,
                            fillColor: Color(0xFFE9ECEF),
                          ),
                          maxLines: 2,
                        ),
                        const SizedBox(height: 14),
                      ],
                      // New password field
                      TextField(
                        controller: _passwordController,
                        obscureText: hidePassword,
                        decoration: InputDecoration(
                          labelText: 'New Password',
                          border: const OutlineInputBorder(),
                          filled: true,
                          fillColor: const Color(0xFFE9ECEF),
                          suffixIcon: IconButton(
                            icon: Icon(hidePassword
                                ? Icons.visibility_off
                                : Icons.visibility),
                            onPressed: () =>
                                setState(() => hidePassword = !hidePassword),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (message.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(
                            message,
                            style: const TextStyle(color: Colors.green),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      if (error.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(
                            error,
                            style: const TextStyle(color: Colors.red),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: loading ? null : handleSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _accentBlue,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: loading
                              ? const CircularProgressIndicator(
                                  color: Colors.white)
                              : const Text(
                                  'Reset Password',
                                  style: TextStyle(
                                      color: Colors.white, fontSize: 15),
                                ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                        ),
                        child: const Text('Back to Login'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
