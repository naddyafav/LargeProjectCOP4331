import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'login_page.dart';
import 'clouds_widget.dart';

const Color _skyBlue = Color(0xFFACDFFA);
const Color _accentBlue = Color(0xFF7AA2E3);
const Color _cardBg = Color(0xFFF8F9FA);

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final TextEditingController _emailController = TextEditingController();
  String message = '';
  String error = '';
  bool loading = false;

  Future<void> handleSubmit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => error = 'Please enter your email.');
      return;
    }

    setState(() {
      loading = true;
      message = '';
      error = '';
    });

    try {
      final res = await http.post(
        Uri.parse('http://104.236.41.135:5050/password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      final data = jsonDecode(res.body);

      if (res.statusCode == 201) {
        setState(() {
          message = data['message'] ??
              'Email sent. Check your inbox to reset your password.';
          error = '';
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
          error = data['error'] ?? 'Email failed.';
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
    _emailController.dispose();
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
                  const SizedBox(height: 20),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Registered Email',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => handleSubmit(),
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
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Send Email',
                              style: TextStyle(color: Colors.white, fontSize: 15),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () => Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginPage()),
                    ),
                    child: const Text('Remember your password? Login'),
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
