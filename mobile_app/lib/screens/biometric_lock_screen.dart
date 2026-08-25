import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/biometric_provider.dart';
import '../utils/constants.dart';
import '../services/biometric_service.dart';
import 'main_shell.dart';

class BiometricLockScreen extends StatefulWidget {
  const BiometricLockScreen({super.key});

  @override
  State<BiometricLockScreen> createState() => _BiometricLockScreenState();
}

class _BiometricLockScreenState extends State<BiometricLockScreen>
    with SingleTickerProviderStateMixin {
  bool _isAuthenticating = false;
  bool _failed = false;
  late AnimationController _shakeController;

  @override
  void initState() {
    super.initState();
    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    // Delay auto-trigger so the Activity/Fragment is fully ready
    // (Oppo ColorOS needs a moment after screen transition)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 600), () {
        if (mounted) _authenticate();
      });
    });
  }

  @override
  void dispose() {
    _shakeController.dispose();
    super.dispose();
  }

  Future<void> _authenticate() async {
    if (_isAuthenticating) return;
    setState(() {
      _isAuthenticating = true;
      _failed = false;
    });

    // biometricOnly: false means Android handles fallback to PIN after multiple failures
    final success = await BiometricService.authenticate(usePasscodeFallback: true);

    if (!mounted) return;
    if (success) {
      _navigateToApp();
    } else {
      setState(() {
        _isAuthenticating = false;
        _failed = true;
      });
      _shakeController.forward(from: 0);
    }
  }

  Future<void> _usePasscode() async {
    setState(() => _isAuthenticating = true);
    final success = await BiometricService.authenticateWithDeviceCredentials();
    if (!mounted) return;
    if (success) {
      _navigateToApp();
    } else {
      setState(() {
        _isAuthenticating = false;
        _failed = true;
      });
      _shakeController.forward(from: 0);
    }
  }

  void _navigateToApp() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, animation, __) => const MainShell(),
        transitionsBuilder: (_, animation, __, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? const [Color(0xFF0F0C29), Color(0xFF302B63), Color(0xFF24243E)]
                : const [Color(0xFFFFE5F1), Color(0xFFE8E5FF), Color(0xFFFDFBFB)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 32.w),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // App branding
                  Text(
                    'MyClaim',
                    style: GoogleFonts.poppins(
                      fontSize: 28.sp,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ).animate().fadeIn(delay: 100.ms),

                  SizedBox(height: 8.h),
                  Text(
                    'Your Claims. Simplified.',
                    style: GoogleFonts.poppins(
                      fontSize: 13.sp,
                      color: context.textSecondaryColor,
                    ),
                  ).animate().fadeIn(delay: 150.ms),

                  SizedBox(height: 60.h),

                  // Biometric icon with shake animation on failure
                  AnimatedBuilder(
                    animation: _shakeController,
                    builder: (context, child) {
                      final shake = _shakeController.value;
                      final offset = shake < 0.5
                          ? -10 * shake * 2
                          : 10 * (shake - 0.5) * 2;
                      return Transform.translate(
                        offset: Offset(offset * 6, 0),
                        child: child,
                      );
                    },
                    child: Container(
                      width: 100.w,
                      height: 100.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDark ? Colors.white10 : Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.25),
                            blurRadius: 30,
                            spreadRadius: 5,
                          ),
                        ],
                      ),
                      child: Icon(
                        _failed
                            ? Icons.fingerprint
                            : _isAuthenticating
                                ? Icons.fingerprint
                                : Icons.fingerprint,
                        size: 56.sp,
                        color: _failed ? AppColors.error : AppColors.primary,
                      ),
                    ).animate(target: _isAuthenticating ? 1 : 0)
                        .scaleXY(end: 1.08, duration: 800.ms, curve: Curves.easeInOut),
                  ),

                  SizedBox(height: 32.h),

                  // Status text
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: Text(
                      _failed
                          ? 'Authentication failed. Try again.'
                          : _isAuthenticating
                              ? 'Place your finger on the sensor'
                              : 'Tap to unlock',
                      key: ValueKey(_failed ? 'failed' : _isAuthenticating ? 'auth' : 'idle'),
                      style: GoogleFonts.poppins(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w600,
                        color: _failed ? AppColors.error : context.textColor,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                  SizedBox(height: 48.h),

                  // Main unlock button
                  GestureDetector(
                    onTap: _isAuthenticating ? null : _authenticate,
                    child: Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(vertical: 16.h),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(32.r),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.fingerprint, color: Colors.white, size: 20.sp),
                          SizedBox(width: 10.w),
                          Text(
                            'Unlock with Biometric',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),

                  SizedBox(height: 16.h),

                  // Passcode fallback
                  TextButton(
                    onPressed: _isAuthenticating ? null : _usePasscode,
                    child: Text(
                      'Use Phone Passcode instead',
                      style: GoogleFonts.poppins(
                        fontSize: 13.sp,
                        color: context.textSecondaryColor,
                        fontWeight: FontWeight.w500,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ).animate().fadeIn(delay: 400.ms),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Bottom sheet shown after first successful login to ask user to enable biometrics
class BiometricSetupSheet extends StatelessWidget {
  const BiometricSetupSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;

    return Container(
      padding: EdgeInsets.fromLTRB(24.w, 16.h, 24.w, 32.h),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28.r)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40.w,
            height: 4.h,
            decoration: BoxDecoration(
              color: context.borderColor,
              borderRadius: BorderRadius.circular(99.r),
            ),
          ),

          SizedBox(height: 28.h),

          // Biometric icon
          Container(
            width: 72.w,
            height: 72.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withValues(alpha: 0.1),
            ),
            child: Icon(Icons.fingerprint, color: AppColors.primary, size: 40.sp),
          ),

          SizedBox(height: 20.h),

          Text(
            'Enable Biometric Login?',
            style: GoogleFonts.poppins(
              fontSize: 20.sp,
              fontWeight: FontWeight.w800,
              color: context.textColor,
            ),
          ),

          SizedBox(height: 10.h),

          Text(
            'Use your fingerprint or face ID to securely unlock MyClaim every time you open the app — no password needed.',
            style: GoogleFonts.poppins(
              fontSize: 13.sp,
              color: context.textSecondaryColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),

          SizedBox(height: 32.h),

          // Enable button
          GestureDetector(
            onTap: () async {
              final bio = context.read<BiometricProvider>();
              // Enable biometrics and close sheet
              // The parent (login_screen) will detect bio.isEnabled = true
              // and route to BiometricLockScreen where the actual fingerprint scan happens
              await bio.markPromptShown();
              await bio.enable();
              if (context.mounted) Navigator.of(context).pop();
            },
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(vertical: 16.h),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(32.r),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Text(
                'Enable Biometric Login',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          SizedBox(height: 12.h),

          // Skip button
          TextButton(
            onPressed: () async {
              await context.read<BiometricProvider>().markPromptShown();
              if (context.mounted) Navigator.pop(context, false);
            },
            child: Text(
              'Maybe Later',
              style: GoogleFonts.poppins(
                fontSize: 14.sp,
                color: context.textSecondaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
