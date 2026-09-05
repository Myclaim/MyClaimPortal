import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_provider.dart';
import '../providers/biometric_provider.dart';
import '../utils/constants.dart';
import 'biometric_lock_screen.dart';
import 'login_screen.dart';
import 'client/client_shell.dart';
import 'partner/partner_shell.dart';
import 'onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _bgController;
  late AnimationController _pulseController;
  late AnimationController _particleController;
  late AnimationController _rippleController;

  @override
  void initState() {
    super.initState();

    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();

    _rippleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    // Navigate after animation
    _navigateAfterSplash();
  }

  Future<void> _navigateAfterSplash() async {
    await Future.delayed(const Duration(milliseconds: 3200));
    if (!mounted) return;
    final prefs = await SharedPreferences.getInstance();

    // Version-based reset: clears onboarding flag if version key doesn't match
    const currentOnboardingVersion = 'v2';
    final savedVersion = prefs.getString('onboarding_version');
    if (savedVersion != currentOnboardingVersion) {
      await prefs.remove('onboarding_complete');
      await prefs.setString('onboarding_version', currentOnboardingVersion);
    }

    final onboardingDone = prefs.getBool('onboarding_complete') ?? false;
    if (!mounted) return;
    
    Widget next;
    if (!onboardingDone) {
      next = const OnboardingScreen();
    } else {
      final auth = context.read<AuthProvider>();
      await auth.checkStoredAuth();
      if (!mounted) return;

      if (auth.isAuthenticated) {
        // Check biometric lock
        final bio = context.read<BiometricProvider>();
        await bio.refresh();
        if (!mounted) return;
        final role = auth.userRole;
        final shell = role == 'partner'
            ? const PartnerShell()
            : const ClientShell();
        next = bio.isEnabled ? const BiometricLockScreen() : shell;
      } else {
        next = const LoginScreen();
      }
    }
    
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, animation, __) => next,
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 700),
      ),
    );
  }

  @override
  void dispose() {
    _bgController.dispose();
    _pulseController.dispose();
    _particleController.dispose();
    _rippleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: Listenable.merge(
            [_bgController, _pulseController, _particleController, _rippleController]),
        builder: (context, _) {
          return Stack(
            children: [
              // ─── Animated Gradient Background ───────────────────────────
              _AnimatedGradientBackground(controller: _bgController),

              // ─── Ripple Rings ────────────────────────────────────────────
              _RippleRings(controller: _rippleController),

              // ─── Glassmorphic Card + Logo ─────────────────────────────────
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Glowing glass container
                    _GlassCard(pulseController: _pulseController),

                    SizedBox(height: 40.h),

                    // App name with shimmer
                    _AppNameText(),

                    SizedBox(height: 12.h),

                    // Tagline
                    Text(
                      'Your Claims. Simplified.',
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        color: Theme.of(context).brightness == Brightness.dark 
                            ? Colors.white.withValues(alpha: 0.65)
                            : AppColors.textLight.withValues(alpha: 0.8),
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w300,
                      ),
                    ).animate().fadeIn(delay: 1200.ms, duration: 800.ms),

                    SizedBox(height: 60.h),

                    // Loading indicator
                    _LoadingDots(),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Animated Gradient Background
// ─────────────────────────────────────────────────────────────────
class _AnimatedGradientBackground extends StatelessWidget {
  final AnimationController controller;
  const _AnimatedGradientBackground({required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final t = controller.value;
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment(math.cos(t * math.pi) * 0.5, -1.0),
          end: Alignment(math.sin(t * math.pi) * 0.5, 1.0),
          colors: isDark ? const [
            Color(0xFF0F0C29), // Deep space
            Color(0xFF302B63), // Purple
            Color(0xFF24243E), // Dark Slate
            Color(0xFF8A2387), // Aesthetic pink/magenta accent
          ] : const [
            Color(0xFFFFE5F1), // Pastel pink
            Color(0xFFE8E5FF), // Lavender
            Color(0xFFFDFBFB), // Soft white
            Color(0xFFE0C3FC), // Soft purple accent
          ],
          stops: const [0.0, 0.3, 0.65, 1.0],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Ripple Rings
// ─────────────────────────────────────────────────────────────────
class _RippleRings extends StatelessWidget {
  final AnimationController controller;
  const _RippleRings({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: List.generate(3, (i) {
          final delay = i / 3.0;
          final progress = ((controller.value + delay) % 1.0);
          final opacity = (1.0 - progress).clamp(0.0, 1.0) * 0.18;
          final size = 160.w + progress * 260.w;
          return Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Theme.of(context).brightness == Brightness.dark 
                  ? const Color(0xFFE0C3FC).withValues(alpha: opacity)
                  : const Color(0xFF8A2387).withValues(alpha: opacity * 0.5),
                width: 1.5,
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Glass Card with Logo
// ─────────────────────────────────────────────────────────────────
class _GlassCard extends StatelessWidget {
  final AnimationController pulseController;
  const _GlassCard({required this.pulseController});

  @override
  Widget build(BuildContext context) {
    final pulse = pulseController.value;
    final glowRadius = 20.0 + pulse * 25.0;

    return Container(
      width: 160.w,
      height: 160.w,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4ADE80).withValues(alpha: 0.25 + pulse * 0.15),
            blurRadius: glowRadius,
            spreadRadius: 4,
          ),
          BoxShadow(
            color: const Color(0xFFFF6B35).withValues(alpha: 0.12 + pulse * 0.08),
            blurRadius: glowRadius * 1.5,
            spreadRadius: 2,
          ),
        ],
        gradient: RadialGradient(
          colors: [
            Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.18) : Colors.white.withValues(alpha: 0.8),
            Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.06) : Colors.white.withValues(alpha: 0.4),
          ],
        ),
        border: Border.all(
          color: Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.2 + pulse * 0.1) : Colors.black.withValues(alpha: 0.05 + pulse * 0.05),
          width: 1.5,
        ),
      ),
      child: ClipOval(
        child: Padding(
          padding: EdgeInsets.all(24.w),
          child: Image.asset(
            'assets/images/logo.png',
            fit: BoxFit.contain,
          ),
        ),
      ),
    )
        .animate()
        .scale(
          begin: const Offset(0.4, 0.4),
          end: const Offset(1.0, 1.0),
          duration: 900.ms,
          curve: Curves.elasticOut,
        )
        .fadeIn(duration: 600.ms);
  }
}

// ─────────────────────────────────────────────────────────────────
// App Name with Shimmer
// ─────────────────────────────────────────────────────────────────
class _AppNameText extends StatelessWidget {
  const _AppNameText();

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        colors: [
          Color(0xFF4ADE80),
          Color(0xFFFFFFFF),
          Color(0xFF4ADE80),
        ],
        stops: [0.0, 0.5, 1.0],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(bounds),
      child: Text(
        'MyClaim',
        style: GoogleFonts.poppins(
          fontSize: 42.sp,
          fontWeight: FontWeight.w800,
          color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppColors.textLight,
          letterSpacing: -0.5,
          height: 1.0,
        ),
      ),
    )
        .animate()
        .slideY(
          begin: 0.3,
          end: 0.0,
          duration: 800.ms,
          delay: 600.ms,
          curve: Curves.easeOutCubic,
        )
        .fadeIn(duration: 600.ms, delay: 600.ms);
  }
}

// ─────────────────────────────────────────────────────────────────
// Loading Dots
// ─────────────────────────────────────────────────────────────────
class _LoadingDots extends StatelessWidget {
  const _LoadingDots();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (i) {
        return Container(
          margin: EdgeInsets.symmetric(horizontal: 4.w),
          width: 7.w,
          height: 7.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppColors.primary,
          ),
        )
            .animate(onPlay: (c) => c.repeat())
            .scaleXY(
              begin: 0.6,
              end: 1.2,
              duration: 600.ms,
              delay: (i * 200).ms,
              curve: Curves.easeInOut,
            )
            .then()
            .scaleXY(
              begin: 1.2,
              end: 0.6,
              duration: 600.ms,
              curve: Curves.easeInOut,
            );
      }),
    )
        .animate()
        .fadeIn(delay: 1600.ms, duration: 600.ms)
        .slideY(begin: 0.5, end: 0.0, delay: 1600.ms, duration: 400.ms);
  }
}


