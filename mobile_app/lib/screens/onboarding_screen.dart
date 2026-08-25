import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';

// ─── Onboarding Data Model ────────────────────────────────────────
class _OnboardingData {
  final String image;
  final String title;
  final String subtitle;
  final String description;
  final List<Color> gradientColors;
  final List<Color> lightGradientColors;
  final Color accentColor;
  final IconData badgeIcon;

  const _OnboardingData({
    required this.image,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.gradientColors,
    required this.lightGradientColors,
    required this.accentColor,
    required this.badgeIcon,
  });
}

final _pages = [
  _OnboardingData(
    image: 'assets/images/onboarding_1.png',
    title: 'All Your Insurance,',
    subtitle: 'One Powerful Shield',
    description:
        'MyClaim India brings all your insurance policies — health, motor, life & more — under one roof. Stay protected and informed, always.',
    gradientColors: [
      const Color(0xFF0F0C29),
      const Color(0xFF302B63),
      const Color(0xFF24243E),
    ],
    lightGradientColors: [
      const Color(0xFFFBC2EB),
      const Color(0xFFA6C1EE),
      const Color(0xFFFBC2EB),
    ],
    accentColor: const Color(0xFF4ADE80),
    badgeIcon: Icons.shield_rounded,
  ),
  _OnboardingData(
    image: 'assets/images/onboarding_2.png',
    title: 'File Claims',
    subtitle: 'In Minutes, Not Days',
    description:
        'Submit claims directly from your phone. Upload documents, fill details and get your claim registered instantly — no paperwork, no hassle.',
    gradientColors: [
      const Color(0xFF0F0C29),
      const Color(0xFF302B63),
      const Color(0xFF24243E),
    ],
    lightGradientColors: [
      const Color(0xFFFBC2EB),
      const Color(0xFFA6C1EE),
      const Color(0xFFFBC2EB),
    ],
    accentColor: const Color(0xFF34D399),
    badgeIcon: Icons.upload_file_rounded,
  ),
  _OnboardingData(
    image: 'assets/images/onboarding_3.png',
    title: 'Track Every Step',
    subtitle: 'Real-Time Status Updates',
    description:
        'Know exactly where your claim stands at every stage. From submission to settlement — get live updates, notifications and expert support.',
    gradientColors: [
      const Color(0xFF0F0C29),
      const Color(0xFF302B63),
      const Color(0xFF24243E),
    ],
    lightGradientColors: [
      const Color(0xFFFBC2EB),
      const Color(0xFFA6C1EE),
      const Color(0xFFFBC2EB),
    ],
    accentColor: const Color(0xFF86EFAC),
    badgeIcon: Icons.track_changes_rounded,
  ),
  _OnboardingData(
    image: 'assets/images/onboarding_4.png',
    title: 'Fast Settlements,',
    subtitle: 'Maximum Recoveries',
    description:
        'Our expert team maximises your claim value and ensures the fastest possible settlement. Your money. Your rights. Our mission.',
    gradientColors: [
      const Color(0xFF0F0C29),
      const Color(0xFF302B63),
      const Color(0xFF24243E),
    ],
    lightGradientColors: [
      const Color(0xFFFBC2EB),
      const Color(0xFFA6C1EE),
      const Color(0xFFFBC2EB),
    ],
    accentColor: const Color(0xFFFFB347),
    badgeIcon: Icons.emoji_events_rounded,
  ),
];

// ─── Main Onboarding Screen ───────────────────────────────────────
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  late AnimationController _bgController;
  late AnimationController _floatController;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);

    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _bgController.dispose();
    _floatController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_complete', true);
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, animation, __) => const LoginScreen(),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 700),
      ),
    );
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _skip() => _completeOnboarding();

  @override
  Widget build(BuildContext context) {
    final page = _pages[_currentPage];

    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: AnimatedBuilder(
        animation: Listenable.merge([_bgController, _floatController, _pulseController]),
        builder: (context, _) {
          return Stack(
            children: [
              // ── Animated Gradient BG ──────────────────────────
              AnimatedContainer(
                duration: const Duration(milliseconds: 600),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark ? page.gradientColors : page.lightGradientColors,
                  ),
                ),
                width: double.infinity,
                height: double.infinity,
              ),

              // Removed mesh orbs

              // ── Page Content ─────────────────────────────────
              PageView.builder(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _OnboardingPage(
                    data: _pages[index],
                    isActive: index == _currentPage,
                    floatValue: _floatController.value,
                    pulseValue: _pulseController.value,
                  );
                },
              ),

              // ── Top Skip Button ───────────────────────────────
              if (_currentPage < _pages.length - 1)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 12.h,
                  right: 20.w,
                  child: TextButton(
                    onPressed: _skip,
                    style: TextButton.styleFrom(
                      foregroundColor: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.5),
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    ),
                    child: Text(
                      'Skip',
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w500,
                        color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.5),
                      ),
                    ),
                  ),
                ),

              // ── Bottom Controls ───────────────────────────────
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: _BottomControls(
                  currentPage: _currentPage,
                  totalPages: _pages.length,
                  accentColor: page.accentColor,
                  onNext: _nextPage,
                  pulseValue: _pulseController.value,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

}

// ─── Individual Page Widget ───────────────────────────────────────
class _OnboardingPage extends StatelessWidget {
  final _OnboardingData data;
  final bool isActive;
  final double floatValue;
  final double pulseValue;

  const _OnboardingPage({
    required this.data,
    required this.isActive,
    required this.floatValue,
    required this.pulseValue,
  });

  @override
  Widget build(BuildContext context) {
    final floatOffset = math.sin(floatValue * math.pi) * 10.0;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 28.w),
      child: Column(
        children: [
          SizedBox(height: MediaQuery.of(context).padding.top + 60.h),

          // ── Illustration Card ──────────────────────────────
          Expanded(
            flex: 5,
            child: Transform.translate(
              offset: Offset(0, floatOffset),
              child: _IllustrationCard(
                data: data,
                isActive: isActive,
                pulseValue: pulseValue,
              ),
            ),
          ),

          SizedBox(height: 36.h),

          // ── Text Content ───────────────────────────────────
          Expanded(
            flex: 3,
            child: _TextContent(data: data, isActive: isActive),
          ),

          // Space for bottom controls
          SizedBox(height: 160.h),
        ],
      ),
    );
  }
}

// ─── Illustration Card ────────────────────────────────────────────
class _IllustrationCard extends StatelessWidget {
  final _OnboardingData data;
  final bool isActive;
  final double pulseValue;

  const _IllustrationCard({
    required this.data,
    required this.isActive,
    required this.pulseValue,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Outer glow ring
        Container(
          width: 300.w,
          height: 300.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: data.accentColor.withValues(alpha: 0.08 + pulseValue * 0.06),
              width: 1,
            ),
          ),
        ),
        Container(
          width: 260.w,
          height: 260.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: data.accentColor.withValues(alpha: 0.12 + pulseValue * 0.08),
              width: 1.5,
            ),
          ),
        ),

        // Glass card
        Container(
          width: 300.w,
          height: 260.w,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(32.r),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.10) : Colors.white.withValues(alpha: 0.60),
                Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.04) : Colors.white.withValues(alpha: 0.20),
              ],
            ),
            border: Border.all(
              color: Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.12) : Colors.white.withValues(alpha: 0.5),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: data.accentColor.withValues(alpha: 0.15 + pulseValue * 0.1),
                blurRadius: 40,
                spreadRadius: 5,
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32.r),
            child: Padding(
              padding: EdgeInsets.all(20.w),
              child: Image.asset(
                data.image,
                fit: BoxFit.contain,
              ),
            ),
          ),
        )
            .animate(target: isActive ? 1 : 0)
            .scale(
              begin: const Offset(0.85, 0.85),
              end: const Offset(1.0, 1.0),
              duration: 600.ms,
              curve: Curves.easeOutBack,
            )
            .fadeIn(duration: 500.ms),

        // Badge icon top-right
        Positioned(
          top: 14.h,
          right: 28.w,
          child: Container(
            width: 44.w,
            height: 44.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [data.accentColor, data.accentColor.withValues(alpha: 0.7)],
              ),
              boxShadow: [
                BoxShadow(
                  color: data.accentColor.withValues(alpha: 0.4),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(
              data.badgeIcon,
              color: Colors.white,
              size: 22.sp,
            ),
          )
              .animate(target: isActive ? 1 : 0)
              .scale(begin: const Offset(0, 0), end: const Offset(1, 1), duration: 500.ms, delay: 300.ms, curve: Curves.elasticOut),
        ),
      ],
    );
  }
}

// ─── Text Content ─────────────────────────────────────────────────
class _TextContent extends StatelessWidget {
  final _OnboardingData data;
  final bool isActive;

  const _TextContent({required this.data, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Title line 1
        Text(
          data.title,
          textAlign: TextAlign.center,
          style: GoogleFonts.poppins(
            fontSize: 28.sp,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFFE2E8F0) : const Color(0xFF1E293B),
            height: 1.2,
          ),
        )
            .animate(target: isActive ? 1 : 0)
            .slideY(begin: 0.3, end: 0, duration: 500.ms, curve: Curves.easeOutCubic)
            .fadeIn(duration: 400.ms),

        // Accent subtitle
        ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            colors: [data.accentColor, data.accentColor.withValues(alpha: 0.75)],
          ).createShader(bounds),
          child: Text(
            data.subtitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 28.sp,
              fontWeight: FontWeight.w800,
              color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black87,
              height: 1.2,
            ),
          ),
        )
            .animate(target: isActive ? 1 : 0)
            .slideY(begin: 0.3, end: 0, duration: 500.ms, delay: 80.ms, curve: Curves.easeOutCubic)
            .fadeIn(duration: 400.ms, delay: 80.ms),

        SizedBox(height: 16.h),

        // Accent divider
        Container(
          width: 48.w,
          height: 3,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(2),
            gradient: LinearGradient(
              colors: [data.accentColor, data.accentColor.withValues(alpha: 0.3)],
            ),
          ),
        )
            .animate(target: isActive ? 1 : 0)
            .scaleX(begin: 0, end: 1, duration: 500.ms, delay: 150.ms, curve: Curves.easeOutCubic),

        SizedBox(height: 16.h),

        // Description
        Text(
          data.description,
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 14.sp,
            color: Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.65) : Colors.black.withValues(alpha: 0.6),
            height: 1.65,
            fontWeight: FontWeight.w400,
          ),
        )
            .animate(target: isActive ? 1 : 0)
            .slideY(begin: 0.2, end: 0, duration: 500.ms, delay: 200.ms, curve: Curves.easeOutCubic)
            .fadeIn(duration: 400.ms, delay: 200.ms),
      ],
    );
  }
}

// ─── Bottom Controls ──────────────────────────────────────────────
class _BottomControls extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final Color accentColor;
  final VoidCallback onNext;
  final double pulseValue;

  const _BottomControls({
    required this.currentPage,
    required this.totalPages,
    required this.accentColor,
    required this.onNext,
    required this.pulseValue,
  });

  bool get _isLast => currentPage == totalPages - 1;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(28.w, 20.h, 28.w, MediaQuery.of(context).padding.bottom + 28.h),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Theme.of(context).brightness == Brightness.dark ? Colors.black.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.5),
            Theme.of(context).brightness == Brightness.dark ? Colors.black.withValues(alpha: 0.75) : Colors.white.withValues(alpha: 0.85),
          ],
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Dot indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(totalPages, (i) => _Dot(
              isActive: i == currentPage,
              color: accentColor,
            )),
          ),

          SizedBox(height: 28.h),

          // Action button
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            width: double.infinity,
            height: 58.h,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18.r),
              gradient: LinearGradient(
                colors: [
                  accentColor,
                  Theme.of(context).brightness == Brightness.dark 
                      ? accentColor.withValues(alpha: 0.8)
                      : accentColor.withValues(alpha: 0.6)
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withValues(alpha: 0.35 + pulseValue * 0.15),
                  blurRadius: 20 + pulseValue * 8,
                  offset: const Offset(0, 6),
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onNext,
                borderRadius: BorderRadius.circular(18.r),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _isLast ? 'Get Started' : 'Next Step',
                        style: GoogleFonts.poppins(
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w700,
                          color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white,
                          letterSpacing: 0.3,
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Icon(
                        _isLast ? Icons.rocket_launch_rounded : Icons.arrow_forward_rounded,
                        color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white,
                        size: 20.sp,
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

// ─── Dot Indicator ────────────────────────────────────────────────
class _Dot extends StatelessWidget {
  final bool isActive;
  final Color color;

  const _Dot({required this.isActive, required this.color});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOutCubic,
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      width: isActive ? 28.w : 8.w,
      height: 8.h,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.r),
        color: isActive ? color : Colors.white.withValues(alpha: 0.25),
        boxShadow: isActive
            ? [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 6, spreadRadius: 1)]
            : [],
      ),
    );
  }
}
