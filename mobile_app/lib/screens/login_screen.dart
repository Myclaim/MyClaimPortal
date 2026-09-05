import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../providers/biometric_provider.dart';
import '../utils/constants.dart';
import 'biometric_lock_screen.dart';
import 'guest_screen.dart';
import 'client/client_shell.dart';
import 'partner/partner_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  void _handleLogin() async {
    if (_emailController.text.trim().isEmpty || _passwordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter your email and password.'), backgroundColor: AppColors.warning),
      );
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.login(_emailController.text.trim(), _passwordController.text.trim());

    if (success && mounted) {
      // Check if we should show biometric setup prompt (first login, biometrics available, prompt not shown yet)
      final bio = context.read<BiometricProvider>();
      await bio.refresh();

      if (bio.isAvailable && !bio.promptShown && mounted) {
        // Show the biometric setup bottom sheet and WAIT for it to finish
        await showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          isDismissible: false,  // prevent accidental swipe dismiss
          enableDrag: false,
          builder: (_) => const BiometricSetupSheet(),
        );
      }

      if (!mounted) return;
      // CRITICAL: Re-read bio state AFTER sheet closed
      // If user enabled biometrics, route to lock screen (they must authenticate)
      // If user skipped, go straight to MainShell
      await bio.refresh();
      if (!mounted) return;
      if (bio.isEnabled) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const BiometricLockScreen()),
        );
      } else {
        final role = context.read<AuthProvider>().userRole;
        final shell = role == 'partner' ? const PartnerShell() : const ClientShell();
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => shell),
        );
      }
    } else if (!success && mounted) {
      final errorMsg = auth.errorMessage ?? 'Login failed. Please check your credentials.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.error_outline, color: Colors.white, size: 18.sp),
              SizedBox(width: 10.w),
              Expanded(child: Text(errorMsg, style: TextStyle(color: Colors.white))),
            ],
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isLoading = auth.isLoading;

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Spacer(flex: 1),
                      // App Logo / Branding
                      Center(
                        child: Column(
                          children: [
                            Image.asset(
                              'assets/images/logo.png',
                              width: 80.w,
                              height: 80.w,
                              fit: BoxFit.contain,
                            ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),
                            SizedBox(height: 16.h),
                            Text(
                              'MyClaim',
                              style: TextStyle(
                                fontSize: 24.sp,
                                fontWeight: FontWeight.w900,
                                color: AppColors.secondary,
                                letterSpacing: -0.5,
                              ),
                            ).animate().fadeIn(delay: 200.ms),
                          ],
                        ),
                      ),
                      Spacer(flex: 1),
                      // Login Bottom Sheet Container
                      Container(
                        padding: EdgeInsets.all(32.r),
                        decoration: BoxDecoration(
                          color: context.surfaceColor,
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(100.r),
                            topRight: Radius.circular(32.r),
                            bottomLeft: Radius.circular(32.r),
                            bottomRight: Radius.circular(32.r),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 20,
                              offset: const Offset(0, -5),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            SizedBox(height: 10.h),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Login',
                                  style: TextStyle(
                                    fontSize: 32.sp,
                                    fontWeight: FontWeight.bold,
                                    color: context.textColor,
                                  ),
                                ),
                                Container(
                                  width: 60.w,
                                  height: 2.h,
                                  margin: EdgeInsets.only(top: 8.h),
                                  color: context.textColor.withValues(alpha: 0.5),
                                ),
                              ],
                            ).animate().slideX(begin: -0.1).fadeIn(),
                            
                            SizedBox(height: 40.h),
                            
                            // Email Field
                            TextField(
                              controller: _emailController,
                              style: TextStyle(color: context.textColor, fontSize: 16.sp),
                              decoration: InputDecoration(
                                labelText: 'Email Address',
                                labelStyle: TextStyle(color: context.textSecondaryColor, fontSize: 14.sp),
                                suffixIcon: Icon(Icons.email_outlined, color: context.textColor, size: 22.sp),
                                enabledBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: context.borderColor),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: AppColors.secondary, width: 2),
                                ),
                                contentPadding: EdgeInsets.symmetric(vertical: 16.h),
                                filled: false,
                              ),
                              keyboardType: TextInputType.emailAddress,
                            ).animate().slideX(begin: -0.1, delay: 200.ms).fadeIn(),
                            
                            SizedBox(height: 24.h),
                            
                            // Password Field
                            TextField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              style: TextStyle(color: context.textColor, fontSize: 16.sp),
                              decoration: InputDecoration(
                                labelText: 'Password',
                                labelStyle: TextStyle(color: context.textSecondaryColor, fontSize: 14.sp),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                    color: context.textColor,
                                    size: 22.sp,
                                  ),
                                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                ),
                                enabledBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: context.borderColor),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: AppColors.secondary, width: 2),
                                ),
                                contentPadding: EdgeInsets.symmetric(vertical: 16.h),
                                filled: false,
                              ),
                            ).animate().slideY(begin: 0.1, delay: 300.ms).fadeIn(),
                            
                            SizedBox(height: 16.h),
                            
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () {},
                                child: Text('Forgot Password?', style: TextStyle(color: context.textColor, fontSize: 13.sp, fontWeight: FontWeight.w600)),
                              ),
                            ).animate().fadeIn(delay: 400.ms),
                            
                            SizedBox(height: 32.h),
                            
                            Center(
                              child: SizedBox(
                                width: 200.w,
                                child: ElevatedButton(
                                  onPressed: isLoading ? null : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.secondary, // The pink color
                                    foregroundColor: Colors.white,
                                    padding: EdgeInsets.symmetric(vertical: 16.h),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30.r)),
                                    elevation: 5,
                                    shadowColor: AppColors.secondary.withValues(alpha: 0.5),
                                  ),
                                  child: isLoading
                                      ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                      : Text('Login', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w700)),
                                ),
                              ),
                            ).animate().slideY(begin: 0.1, delay: 500.ms).fadeIn(),

                            SizedBox(height: 20.h),

                            // ── Continue as Guest ──
                            GestureDetector(
                              onTap: () => Navigator.push(
                                context,
                                PageRouteBuilder(
                                  pageBuilder: (_, animation, __) => const GuestScreen(),
                                  transitionsBuilder: (_, animation, __, child) =>
                                      FadeTransition(opacity: animation, child: child),
                                  transitionDuration: const Duration(milliseconds: 400),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Not registered? ',
                                    style: TextStyle(
                                      fontSize: 13.sp,
                                      color: context.textSecondaryColor,
                                    ),
                                  ),
                                  Text(
                                    'Continue as Guest',
                                    style: TextStyle(
                                      fontSize: 13.sp,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primary,
                                      decoration: TextDecoration.underline,
                                      decorationColor: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ).animate().fadeIn(delay: 650.ms),
                            
                            SizedBox(height: 32.h),
                          ],
                        ),
                      ).animate().slideY(begin: 1.0, duration: 600.ms, curve: Curves.easeOutExpo),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
