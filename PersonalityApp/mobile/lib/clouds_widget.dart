import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'dart:math' as math;

// ── Cloud assets ──────────────────────────────────────────────────────────────

const _cloudAssets = [
  'assets/cloud1.png',
  'assets/cloud2.png',
  'assets/cloud3.png',
];

// ── Cloud data model ──────────────────────────────────────────────────────────

class _CloudData {
  /// Normalized start offset used to compute position each tick.
  /// raw = normalizedStart + speed * elapsedSeconds
  /// then wrapped via safe modulo to keep the cloud cycling infinitely.
  final double normalizedStart;
  final double topFraction; // 0..1 of screen height
  final double width;       // logical pixels
  final double speed;       // pixels per second
  final bool leftToRight;
  final double opacity;     // 0.4..1.0
  final int imageIndex;     // 0, 1, or 2  → _cloudAssets[imageIndex]

  const _CloudData({
    required this.normalizedStart,
    required this.topFraction,
    required this.width,
    required this.speed,
    required this.leftToRight,
    required this.opacity,
    required this.imageIndex,
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

  int lastImageIndex = -1;
  int nextImage() {
    int idx;
    do {
      idx = rand.nextInt(3);
    } while (idx == lastImageIndex);
    lastImageIndex = idx;
    return idx;
  }

  // ── 10 initial clouds — already scattered on screen ──────────────────────
  for (int i = 0; i < 10; i++) {
    final sizeFactor = rand.nextDouble();
    final width = 100.0 + sizeFactor * 400.0; // 100px .. 500px (matches React)
    final speed = (80.0 - sizeFactor * 40.0) / 10.0; // React uses 80-40s duration → ~px/s
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
      imageIndex: nextImage(),
    ));
  }

  // ── 15 looping clouds — random phases so they spread out over time ────────
  for (int i = 0; i < 15; i++) {
    final sizeFactor = rand.nextDouble();
    final width = 100.0 + sizeFactor * 400.0;
    final speed = (80.0 - sizeFactor * 40.0) / 10.0;
    final total = screenW + width + 100;

    clouds.add(_CloudData(
      normalizedStart: rand.nextDouble() * total,
      topFraction: (rand.nextDouble() * 0.85).clamp(0.0, 0.85),
      width: width,
      speed: speed,
      leftToRight: rand.nextBool(),
      opacity: 0.4 + sizeFactor * 0.6,
      imageIndex: nextImage(),
    ));
  }

  return clouds;
}

// ── Widget ────────────────────────────────────────────────────────────────────

/// Drop this inside a [Stack] as a [Positioned.fill] child to get an animated
/// PNG-cloud background that mirrors the React Clouds component.
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
      // Fixed seed → consistent layout across rebuilds / hot-restarts.
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
              return Stack(
                clipBehavior: Clip.hardEdge,
                children: clouds.map((cloud) {
                  final total = screenW + cloud.width + 100;
                  final raw = cloud.normalizedStart + cloud.speed * _elapsed.value;
                  final wrapped = ((raw % total) + total) % total; // safe modulo

                  final double x;
                  if (cloud.leftToRight) {
                    x = wrapped - (cloud.width + 50);
                  } else {
                    x = screenW + 50 - wrapped;
                  }

                  final y = cloud.topFraction * screenH;

                  return Positioned(
                    left: x,
                    top: y,
                    width: cloud.width,
                    child: Opacity(
                      opacity: cloud.opacity,
                      child: Image.asset(
                        _cloudAssets[cloud.imageIndex],
                        fit: BoxFit.contain,
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
        );
      },
    );
  }
}
