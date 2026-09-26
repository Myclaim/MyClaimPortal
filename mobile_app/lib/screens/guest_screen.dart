import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/constants.dart';
import 'login_screen.dart';
import 'client/quick_actions/become_partner_screen.dart';
import 'client/quick_actions/free_iepf_report_screen.dart';

// ─────────────────────────────────────────────────────────────────
// Guest Screen — Entry point for non-registered users
// ─────────────────────────────────────────────────────────────────
class GuestScreen extends StatefulWidget {
  const GuestScreen({super.key});

  @override
  State<GuestScreen> createState() => _GuestScreenState();
}

class _GuestScreenState extends State<GuestScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _bgController;

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _bgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: AnimatedBuilder(
        animation: _bgController,
        builder: (context, _) {
          return Stack(
            children: [
              _buildBackground(isDark),
              _buildOrbs(isDark),
              SafeArea(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        SizedBox(height: 40.h),
                        _LogoSection()
                            .animate()
                            .fadeIn(duration: 700.ms)
                            .slideY(begin: -0.2, end: 0, curve: Curves.easeOutCubic, duration: 700.ms),
                        SizedBox(height: 12.h),
                        Text(
                          'Your Claims. Simplified.',
                          style: GoogleFonts.inter(
                            fontSize: 13.sp,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.5)
                                : AppColors.textSecondaryLight,
                            letterSpacing: 1.4,
                            fontWeight: FontWeight.w400,
                          ),
                        ).animate().fadeIn(delay: 300.ms, duration: 600.ms),
                        SizedBox(height: 44.h),
                        _WelcomeHeading(isDark: isDark)
                            .animate()
                            .fadeIn(delay: 400.ms, duration: 600.ms)
                            .slideY(begin: 0.2, end: 0, delay: 400.ms, duration: 600.ms, curve: Curves.easeOutCubic),
                        SizedBox(height: 32.h),
                        _GuestCard(
                          delay: 500,
                          badgeColor: AppColors.primary,
                          badgeColorLight: const Color(0xFFDCFCE7),
                          icon: Icons.person_add_rounded,
                          eyebrow: 'Get Started Today',
                          title: 'New Client',
                          subtitle: 'Register to track claims, upload documents & get expert support — all from your phone.',
                          onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('New Client registration — coming soon!', style: GoogleFonts.inter(color: Colors.white)),
                              backgroundColor: AppColors.primary,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              margin: EdgeInsets.all(16.w),
                            ),
                          ),
                        ),
                        SizedBox(height: 16.h),
                        _GuestCard(
                          delay: 650,
                          badgeColor: AppColors.secondary,
                          badgeColorLight: const Color(0xFFFCE7F3),
                          icon: Icons.handshake_rounded,
                          eyebrow: 'Earn Without Limits',
                          title: 'Become a Partner',
                          subtitle: 'Join our associate network. Refer clients, earn commissions & grow your business effortlessly.',
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const BecomePartnerScreen(),
                            ),
                          ),
                        ),
                        SizedBox(height: 16.h),
                        _GuestCard(
                          delay: 800,
                          badgeColor: const Color(0xFF10B981),
                          badgeColorLight: const Color(0xFFDCFCE7),
                          icon: Icons.manage_search_rounded,
                          eyebrow: '100% Free · No Hidden Charges',
                          title: 'Free IEPF Report',
                          subtitle: 'Discover unclaimed shares, dividends & get a comprehensive IEPF recovery report.',
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const FreeIepfReportScreen(),
                            ),
                          ),
                        ),
                        SizedBox(height: 40.h),
                        _LoginDivider(isDark: isDark)
                            .animate()
                            .fadeIn(delay: 900.ms, duration: 600.ms),
                        SizedBox(height: 16.h),
                        _LoginButton()
                            .animate()
                            .fadeIn(delay: 1000.ms, duration: 600.ms)
                            .slideY(begin: 0.3, end: 0, delay: 1000.ms, duration: 500.ms, curve: Curves.easeOutCubic),
                        SizedBox(height: 32.h),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBackground(bool isDark) {
    final t = _bgController.value;
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment(math.cos(t * math.pi) * 0.6, -1.0),
          end: Alignment(math.sin(t * math.pi) * 0.6, 1.0),
          colors: isDark
              ? const [Color(0xFF0A1628), Color(0xFF0F0C29), Color(0xFF1A1040), Color(0xFF0D1F0A)]
              : const [Color(0xFFF0FDF4), Color(0xFFFFE5F1), Color(0xFFF8FAFC), Color(0xFFEFF6FF)],
          stops: const [0.0, 0.3, 0.65, 1.0],
        ),
      ),
    );
  }

  Widget _buildOrbs(bool isDark) {
    return Stack(
      children: [
        Positioned(
          top: -60,
          right: -60,
          child: Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [AppColors.primary.withValues(alpha: isDark ? 0.12 : 0.15), Colors.transparent],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 100,
          left: -80,
          child: Container(
            width: 260,
            height: 260,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [AppColors.secondary.withValues(alpha: isDark ? 0.10 : 0.12), Colors.transparent],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Logo Section
// ─────────────────────────────────────────────────────────────────
class _LogoSection extends StatelessWidget {
  const _LogoSection();

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    return Column(
      children: [
        Container(
          width: 80.w,
          height: 80.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                Colors.white.withValues(alpha: isDark ? 0.15 : 0.9),
                Colors.white.withValues(alpha: isDark ? 0.05 : 0.6),
              ],
            ),
            border: Border.all(color: Colors.white.withValues(alpha: isDark ? 0.15 : 0.4), width: 1.5),
            boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 24, spreadRadius: 2)],
          ),
          child: ClipOval(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
            ),
          ),
        ),
        SizedBox(height: 14.h),
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [Color(0xFF4ADE80), Color(0xFF22C55E), Color(0xFF4ADE80)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ).createShader(bounds),
          child: Text(
            'MyClaim',
            style: GoogleFonts.poppins(fontSize: 28.sp, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5, height: 1.0),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Welcome Heading
// ─────────────────────────────────────────────────────────────────
class _WelcomeHeading extends StatelessWidget {
  final bool isDark;
  const _WelcomeHeading({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Welcome! How can we',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w700, color: isDark ? AppColors.text : AppColors.textLight, height: 1.2),
        ),
        Text(
          'help you today?',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w700, color: AppColors.primary, height: 1.2),
        ),
        SizedBox(height: 8.h),
        Text(
          'Choose an option below to get started',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 13.sp, color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Guest Action Card
// ─────────────────────────────────────────────────────────────────
class _GuestCard extends StatefulWidget {
  final int delay;
  final Color badgeColor;
  final Color badgeColorLight;
  final IconData icon;
  final String eyebrow;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _GuestCard({
    required this.delay,
    required this.badgeColor,
    required this.badgeColorLight,
    required this.icon,
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  State<_GuestCard> createState() => _GuestCardState();
}

class _GuestCardState extends State<_GuestCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20.r),
            color: isDark ? AppColors.surface.withValues(alpha: 0.85) : Colors.white.withValues(alpha: 0.9),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.borderLight,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(color: widget.badgeColor.withValues(alpha: isDark ? 0.12 : 0.08), blurRadius: 20, offset: const Offset(0, 6)),
              BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.06), blurRadius: 12, offset: const Offset(0, 3)),
            ],
          ),
          child: Row(
            children: [
              // Badge Icon
              Container(
                width: 58.w,
                height: 58.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark ? widget.badgeColor.withValues(alpha: 0.15) : widget.badgeColorLight,
                  border: Border.all(color: widget.badgeColor.withValues(alpha: isDark ? 0.3 : 0.2), width: 1.5),
                ),
                child: Icon(widget.icon, color: widget.badgeColor, size: 26.sp),
              ),
              SizedBox(width: 16.w),
              // Text
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.eyebrow.toUpperCase(),
                      style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.w600, color: widget.badgeColor, letterSpacing: 1.0),
                    ),
                    SizedBox(height: 3.h),
                    Text(
                      widget.title,
                      style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w800, color: isDark ? AppColors.text : AppColors.textLight, height: 1.1),
                    ),
                    SizedBox(height: 6.h),
                    Text(
                      widget.subtitle,
                      style: GoogleFonts.inter(fontSize: 12.sp, color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight, height: 1.45),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 12.w),
              // Arrow
              Container(
                width: 34.w,
                height: 34.w,
                decoration: BoxDecoration(shape: BoxShape.circle, color: widget.badgeColor.withValues(alpha: isDark ? 0.15 : 0.12)),
                child: Icon(Icons.arrow_forward_rounded, color: widget.badgeColor, size: 18.sp),
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(delay: widget.delay.ms, duration: 500.ms)
        .slideY(begin: 0.25, end: 0, delay: widget.delay.ms, duration: 500.ms, curve: Curves.easeOutCubic);
  }
}

// ─────────────────────────────────────────────────────────────────
// Login Divider
// ─────────────────────────────────────────────────────────────────
class _LoginDivider extends StatelessWidget {
  final bool isDark;
  const _LoginDivider({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Divider(color: isDark ? Colors.white.withValues(alpha: 0.1) : AppColors.borderLight, thickness: 1)),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 12.w),
          child: Text(
            'Already have an account?',
            style: GoogleFonts.inter(fontSize: 12.sp, color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
          ),
        ),
        Expanded(child: Divider(color: isDark ? Colors.white.withValues(alpha: 0.1) : AppColors.borderLight, thickness: 1)),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Login Button
// ─────────────────────────────────────────────────────────────────
class _LoginButton extends StatelessWidget {
  const _LoginButton();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (_, animation, __) => const LoginScreen(),
          transitionsBuilder: (_, animation, __, child) => FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      ),
      child: Container(
        width: double.infinity,
        height: 54.h,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16.r),
          gradient: const LinearGradient(
            colors: [Color(0xFF00E676), Color(0xFF22C55E), Color(0xFF4ADE80)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.login_rounded, color: Colors.white, size: 20.sp),
            SizedBox(width: 10.w),
            Text(
              'Login to My Account',
              style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.3),
            ),
          ],
        ),
      ),
    );
  }
}
