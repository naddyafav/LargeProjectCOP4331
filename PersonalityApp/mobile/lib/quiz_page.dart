import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'clouds_widget.dart';

const String _apiBase = 'http://104.236.41.135:5050';
const Color _skyBlue = Color(0xFFACDFFA);
const Color _accentBlue = Color(0xFF7AA2E3);
const Color _cardBg = Color(0xFFF8F9FA);

class QuizPage extends StatefulWidget {
  final String token;
  const QuizPage({super.key, required this.token});

  @override
  State<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  List<Map<String, dynamic>> questions = [];
  int current = 0;
  Map<String, int> scores = {
    'dreamer': 0,
    'energy': 0,
    'warmth': 0,
    'daring': 0,
  };
  bool loading = true;
  bool submitting = false;
  String error = '';

  @override
  void initState() {
    super.initState();
    fetchQuestions();
  }

  Future<void> fetchQuestions() async {
    try {
      final res = await http.get(
        Uri.parse('$_apiBase/quiz/questions'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['questions'] != null) {
        setState(() {
          questions = List<Map<String, dynamic>>.from(data['questions']);
          loading = false;
        });
      } else {
        setState(() {
          error = data['error'] ?? 'Failed to load questions.';
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

  Future<void> handleAnswer(Map<String, dynamic> option) async {
    final points = (option['points'] as Map<String, dynamic>?) ?? {};
    final newScores = {
      'dreamer': scores['dreamer']! + ((points['dreamer'] as num?)?.toInt() ?? 0),
      'energy': scores['energy']! + ((points['energy'] as num?)?.toInt() ?? 0),
      'warmth': scores['warmth']! + ((points['warmth'] as num?)?.toInt() ?? 0),
      'daring': scores['daring']! + ((points['daring'] as num?)?.toInt() ?? 0),
    };

    if (current < questions.length - 1) {
      setState(() {
        scores = newScores;
        current++;
      });
      return;
    }

    // Last question — submit scores
    setState(() => submitting = true);

    try {
      final res = await http.post(
        Uri.parse('$_apiBase/quiz/submit'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
        body: jsonEncode({'scores': newScores}),
      );
      final data = jsonDecode(res.body);
      if (res.statusCode == 200) {
        if (mounted) Navigator.pop(context);
      } else {
        setState(() {
          error = data['error'] ?? 'Submission failed.';
          submitting = false;
        });
      }
    } catch (_) {
      setState(() {
        error = 'Server error. Try again later.';
        submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        backgroundColor: _skyBlue,
        body: Stack(
          children: [
            const Positioned.fill(child: CloudsBackground()),
            const Center(child: CircularProgressIndicator()),
          ],
        ),
      );
    }

    if (submitting) {
      return Scaffold(
        backgroundColor: _skyBlue,
        body: Stack(
          children: [
            const Positioned.fill(child: CloudsBackground()),
            const Center(
              child: Text(
                'Finding your cloud...',
                style: TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
      );
    }

    if (error.isNotEmpty) {
      return Scaffold(
        backgroundColor: _skyBlue,
        body: Stack(
          children: [
            const Positioned.fill(child: CloudsBackground()),
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(error, style: const TextStyle(color: Colors.red, fontSize: 16)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(backgroundColor: _accentBlue),
                      child: const Text('Go Back', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    final question = questions[current];
    final options = List<Map<String, dynamic>>.from(question['options'] as List);
    final progress = current / questions.length;

    return Scaffold(
      backgroundColor: _skyBlue,
      body: Stack(
        children: [
          const Positioned.fill(child: CloudsBackground()),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(3),
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.white38,
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF555555)),
                  minHeight: 6,
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    '${current + 1} / ${questions.length}',
                    style: const TextStyle(color: Colors.black54, fontSize: 12),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Question card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: _cardBg,
                  border: Border.all(color: _accentBlue, width: 4),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      question['text'] as String,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: _accentBlue,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    ...options.map(
                      (option) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _OptionButton(
                          label: option['label'] as String,
                          onTap: () => handleAnswer(option),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
          ),
        ],
      ),
    );
  }
}

// ── Option button with press animation ───────────────────────────────────────

class _OptionButton extends StatefulWidget {
  final String label;
  final VoidCallback onTap;
  const _OptionButton({required this.label, required this.onTap});

  @override
  State<_OptionButton> createState() => _OptionButtonState();
}

class _OptionButtonState extends State<_OptionButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: _pressed ? _accentBlue : const Color(0xFFE9ECEF),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          widget.label,
          style: TextStyle(
            color: _pressed ? Colors.white : const Color(0xFF333333),
            fontSize: 15,
          ),
        ),
      ),
    );
  }
}
