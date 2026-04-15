import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'dart:math' as math;

// ── Cloud data model ──────────────────────────────────────────────────────────

class _CloudData {
  /// Normalized start offset in the range [0, screenW + width + 100).
  /// At time T, the raw position is (normalizedStart + speed * T),
  /// then wrapped via modulo to keep the cloud cycling infinitely.
  final double normalizedStart;
  final double topFraction; // 0..1
  final double width;       // logical pixels
  final double speed;       // pixels per second
  final bool leftToRight;
  final double opacity;     // 0.4..1.0
  final int type;           // 0, 1, or 2

  const _CloudData({
    required this.normalizedStart,
    required this.topFraction,
    required this.width,
    required this.speed,
    required this.leftToRight,
    required this.opacity,
    required this.type,
  });
}

List<_CloudData> _generateClouds(math.Random rand, double screenW) {
  final clouds = <_CloudData>[];

  // Mirrors the React Clouds.tsx horizontal/vertical position arrays.
  const horizontalPos = [
    0.02, 0.08, 0.13, 0.25, 0.38, 0.43, 0.615, 0.76, 0.91, 0.97
  ];
  const verticalPos = [
    0.48, 0.05, 0.82, 0.27, 0.66, 0.85, 0.73, 0.1, 0.5, 0.85
  ];

  // ── 10 initial clouds — already scattered on screen ──────────────────────
  for (int i = 0; i < 10; i++) {
    final sizeFactor = rand.nextDouble();
    final width = 70.0 + sizeFactor * 180.0; // 70px .. 250px
    final speed = (50.0 - sizeFactor * 25.0); // ~25..50 px/s
    final total = screenW + width + 100;
    // Map a visible screen position into normalized space.
    final screenPos = horizontalPos[i] * screenW;
    final normalizedStart = (screenPos + width + 50) % total;

    clouds.add(_CloudData(
      normalizedStart: normalizedStart,
      topFraction: verticalPos[i].clamp(0.0, 0.88),
      width: width,
      speed: speed,
      leftToRight: rand.nextBool(),
      opacity: 0.4 + sizeFactor * 0.6,
      type: rand.nextInt(3),
    ));
  }

  // ── 15 looping clouds — random phases so they spread out over time ────────
  for (int i = 0; i < 15; i++) {
    final sizeFactor = rand.nextDouble();
    final width = 70.0 + sizeFactor * 180.0;
    final speed = 50.0 - sizeFactor * 25.0;
    final total = screenW + width + 100;

    clouds.add(_CloudData(
      normalizedStart: rand.nextDouble() * total,
      topFraction: (rand.nextDouble() * 0.85).clamp(0.0, 0.85),
      width: width,
      speed: speed,
      leftToRight: rand.nextBool(),
      opacity: 0.4 + sizeFactor * 0.6,
      type: rand.nextInt(3),
    ));
  }

  return clouds;
}

// ── Widget ────────────────────────────────────────────────────────────────────

/// Drop this inside a [Stack] as a [Positioned.fill] child to get an animated
/// sky-cloud background that mirrors the React Clouds component.
///
/// Example:
/// ```dart
/// Stack(children: [
///   const Positioned.fill(child: CloudsBackground()),
///   // ... rest of page content
/// ])
/// ```
class CloudsBackground extends StatefulWidget {
  const CloudsBackground({super.key});

  @override
  State<CloudsBackground> createState() => _CloudsBackgroundState();
}

class _CloudsBackgroundState extends State<CloudsBackground>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  final ValueNotifier<double> _elapsed = ValueNotifier(0);
  List<_CloudData>? _clouds;
  double _lastScreenW = 0;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      _elapsed.value = elapsed.inMicroseconds / 1e6;
    });
    _ticker.start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    _elapsed.dispose();
    super.dispose();
  }

  List<_CloudData> _getClouds(double screenW) {
    if (_clouds == null || (screenW - _lastScreenW).abs() > 1) {
      _lastScreenW = screenW;
      // Use a fixed seed so cloud layout is consistent between rebuilds.
      _clouds = _generateClouds(math.Random(42), screenW);
    }
    return _clouds!;
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final screenW = constraints.maxWidth;
        final screenH = constraints.maxHeight;
        final clouds = _getClouds(screenW);

        return RepaintBoundary(
          child: AnimatedBuilder(
            animation: _elapsed,
            builder: (context, _) {
              return CustomPaint(
                size: Size(screenW, screenH),
                painter: _CloudPainter(
                  clouds: clouds,
                  elapsedSeconds: _elapsed.value,
                  screenW: screenW,
                  screenH: screenH,
                ),
              );
            },
          ),
        );
      },
    );
  }
}

// ── Painter ───────────────────────────────────────────────────────────────────

class _CloudPainter extends CustomPainter {
  final List<_CloudData> clouds;
  final double elapsedSeconds;
  final double screenW;
  final double screenH;

  const _CloudPainter({
    required this.clouds,
    required this.elapsedSeconds,
    required this.screenW,
    required this.screenH,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final cloud in clouds) {
      _paintCloud(canvas, cloud);
    }
  }

  void _paintCloud(Canvas canvas, _CloudData c) {
    final total = screenW + c.width + 100;
    final raw = c.normalizedStart + c.speed * elapsedSeconds;
    final wrapped = ((raw % total) + total) % total; // safe modulo

    // Convert wrapped position to screen x (left edge of cloud).
    final double x;
    if (c.leftToRight) {
      x = wrapped - (c.width + 50);
    } else {
      // Mirror for right-to-left clouds.
      x = screenW + 50 - wrapped;
    }

    final y = c.topFraction * screenH;
    _drawShape(canvas, Offset(x, y), c.width, c.opacity, c.type);
  }

  void _drawShape(Canvas canvas, Offset o, double w, double opacity, int type) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: opacity)
      ..style = PaintingStyle.fill;

    switch (type % 3) {
      case 0:
        _drawStandard(canvas, paint, o, w);
      case 1:
        _drawTall(canvas, paint, o, w);
      default:
        _drawWispy(canvas, paint, o, w);
    }
  }

  /// Standard puffy cloud — wide, gentle bumps.
  void _drawStandard(Canvas canvas, Paint p, Offset o, double w) {
    final h = w * 0.18;
    // Flat base
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(o.dx + w * 0.05, o.dy - h, w * 0.9, h * 2),
        Radius.circular(h),
      ),
      p,
    );
    // Bumps left → right
    canvas.drawCircle(Offset(o.dx + w * 0.18, o.dy - h), w * 0.17, p);
    canvas.drawCircle(Offset(o.dx + w * 0.37, o.dy - h * 1.7), w * 0.22, p);
    canvas.drawCircle(Offset(o.dx + w * 0.57, o.dy - h * 1.4), w * 0.20, p);
    canvas.drawCircle(Offset(o.dx + w * 0.77, o.dy - h * 1.1), w * 0.17, p);
    canvas.drawCircle(Offset(o.dx + w * 0.91, o.dy - h * 0.6), w * 0.13, p);
  }

  /// Tall cumulus — pronounced vertical stacking.
  void _drawTall(Canvas canvas, Paint p, Offset o, double w) {
    final h = w * 0.20;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(o.dx + w * 0.05, o.dy - h, w * 0.9, h * 2),
        Radius.circular(h),
      ),
      p,
    );
    canvas.drawCircle(Offset(o.dx + w * 0.20, o.dy - h), w * 0.20, p);
    canvas.drawCircle(Offset(o.dx + w * 0.48, o.dy - h * 2.3), w * 0.27, p);
    canvas.drawCircle(Offset(o.dx + w * 0.78, o.dy - h), w * 0.20, p);
    canvas.drawCircle(Offset(o.dx + w * 0.37, o.dy - h * 3.4), w * 0.21, p);
    canvas.drawCircle(Offset(o.dx + w * 0.62, o.dy - h * 2.9), w * 0.19, p);
  }

  /// Wispy cirrus — thin, elongated.
  void _drawWispy(Canvas canvas, Paint p, Offset o, double w) {
    final h = w * 0.10;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(o.dx + w * 0.05, o.dy - h * 0.8, w * 0.9, h * 1.6),
        Radius.circular(h * 0.8),
      ),
      p,
    );
    canvas.drawCircle(Offset(o.dx + w * 0.12, o.dy - h * 0.6), w * 0.13, p);
    canvas.drawCircle(Offset(o.dx + w * 0.32, o.dy - h * 1.2), w * 0.16, p);
    canvas.drawCircle(Offset(o.dx + w * 0.54, o.dy - h * 1.4), w * 0.15, p);
    canvas.drawCircle(Offset(o.dx + w * 0.74, o.dy - h * 0.9), w * 0.13, p);
    canvas.drawCircle(Offset(o.dx + w * 0.91, o.dy - h * 0.4), w * 0.11, p);
  }

  @override
  bool shouldRepaint(_CloudPainter old) =>
      old.elapsedSeconds != elapsedSeconds;
}
