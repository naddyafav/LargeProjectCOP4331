import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'login_page.dart';

const Color _skyBlue = Color(0xFFACDFFA);
const Color _accentBlue = Color(0xFF7AA2E3);
const Color _cardBg = Color(0xFFF8F9FA);

class VerifyEmailPage extends StatefulWidget {
  /// Optional token passed via deep link; if null the user enters it manually.
  final String? token;
  const VerifyEmailPage({super.key, this.token});

  @override
  State<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends State<VerifyEmailPage> {
  late final TextEditingController _tokenController;
  String status = 'idle'; // idle | verifying | success | error
  String message = '';
  bool loading = false;

  @override
  void initState() {
    super.initState();
    _tokenController = TextEditingController(text: widget.token ?? '');
    // Auto-verify if a token was passed in (e.g. via deep link).
    if (widget.token != null && widget.token!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _verify());
    }
  }

  Future<void> _verify() async {
    final token = _tokenController.text.trim();
    if (token.isEmpty) {
      setState(() {
        status = 'error';
        message = 'Please enter your verification token.';
      });
      return;
    }

    setState(() {
      status = 'verifying';
      loading = true;
      message = '';
    });

    try {
      final res = await http.get(
        Uri.parse('http://104.236.41.135:5050/register/verify/$token'),
      );
      final data = jsonDecode(res.body);

      if (res.statusCode == 200) {
        setState(() {
          status = 'success';
          message = data['message'] ?? 'Email verified successfully!';
          loading = false;
        });
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const LoginPage()),
          );
        }
      } else {
        setState(() {
          status = 'error';
          message = data['error'] ?? 'Verification failed.';
          loading = false;
        });
      }
    } catch (_) {
      setState(() {
        status = 'error';
        message = 'Server error. Try again later.';
        loading = false;
      });
    }
  }

  @override
  void dispose() {
    _tokenController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _skyBlue,
      body: SafeArea(
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
                        'Verify Your Email',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: _accentBlue,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildBody(),
                    ],
                  ),
                ),
              ),
            ),
      ),
    );
  }

  Widget _buildBody() {
    if (status == 'verifying') {
      return const Column(
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('Verifying your email…'),
        ],
      );
    }

    if (status == 'success') {
      return Column(
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 52),
          const SizedBox(height: 12),
          Text(
            message,
            style: const TextStyle(color: Colors.green, fontSize: 15),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'Redirecting to login…',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      );
    }

    // idle or error — show input form
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Registration successful! Check your email for a verification link.',
          style: TextStyle(color: Colors.black87),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 6),
        const Text(
          'Copy the token from the link and paste it below:',
          style: TextStyle(color: Colors.grey, fontSize: 13),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _tokenController,
          decoration: const InputDecoration(
            labelText: 'Verification Token',
            border: OutlineInputBorder(),
            filled: true,
            fillColor: Color(0xFFE9ECEF),
          ),
          maxLines: 2,
        ),
        if (status == 'error') ...[
          const SizedBox(height: 10),
          Text(
            message,
            style: const TextStyle(color: Colors.red),
            textAlign: TextAlign.center,
          ),
        ],
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: loading ? null : _verify,
            style: ElevatedButton.styleFrom(
              backgroundColor: _accentBlue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: loading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text(
                    'Verify Email',
                    style: TextStyle(color: Colors.white, fontSize: 15),
                  ),
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: TextButton(
            onPressed: () => Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const LoginPage()),
            ),
            child: const Text('Already verified? Login'),
          ),
        ),
      ],
    );
  }
}
