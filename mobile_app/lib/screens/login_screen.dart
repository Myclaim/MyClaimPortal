import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';

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

    if (!success && mounted) {
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
      backgroundColor: Colors.black, // Dark native feel
      body: Stack(
        children: [
          // Background graphic
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accent.withValues(alpha: 0.3),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ).animate().fadeIn(duration: 1.seconds).scale(),
          Positioned(
            top: 150,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accentDark.withValues(alpha: 0.2),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ).animate().fadeIn(duration: 1.seconds, delay: 200.ms).scale(),

          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: BouncingScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: IntrinsicHeight(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Spacer(flex: 2),
                          // App Logo / Branding
                          Center(
                            child: Container(
                              width: 70,
                              height: 70,
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(20.r),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.accent.withValues(alpha: 0.2),
                                    blurRadius: 30,
                                    offset: Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Icon(Icons.shield_rounded, size: 36.sp, color: AppColors.accent),
                            ).animate().slideY(begin: 0.3, duration: 600.ms, curve: Curves.easeOutBack).fadeIn(),
                          ),
                          Spacer(flex: 3),
                          // Login Bottom Sheet Container
                          Container(
                            padding: EdgeInsets.all(30.r),
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(30.r),
                                topRight: Radius.circular(30.r),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.5),
                                  blurRadius: 20,
                                  offset: Offset(0, -5),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                                  'Welcome Back',
                                  style: TextStyle(
                                    fontSize: 26.sp,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.text,
                                    letterSpacing: -0.5,
                                  ),
                                ).animate().slideX(begin: -0.1).fadeIn(),
                                SizedBox(height: 6.h),
                                Text(
                                  'Sign in to your client portal',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: AppColors.textSecondary,
                                  ),
                                ).animate().slideX(begin: -0.1, delay: 100.ms).fadeIn(),
                                SizedBox(height: 30.h),
                                
                                // Native looking text fields
                                Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    borderRadius: BorderRadius.circular(16.r),
                                  ),
                                  child: TextField(
                                    controller: _emailController,
                                    style: TextStyle(color: AppColors.text, fontSize: 15.sp),
                                    keyboardType: TextInputType.emailAddress,
                                    decoration: InputDecoration(
                                      hintText: 'Email address',
                                      hintStyle: TextStyle(color: AppColors.textSecondary),
                                      prefixIcon: Icon(Icons.email_rounded, color: AppColors.textSecondary, size: 20.sp),
                                      border: InputBorder.none,
                                      contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
                                    ),
                                  ),
                                ).animate().slideY(begin: 0.1, delay: 200.ms).fadeIn(),
                                
                                SizedBox(height: 16.h),
                                
                                Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    borderRadius: BorderRadius.circular(16.r),
                                  ),
                                  child: TextField(
                                    controller: _passwordController,
                                    obscureText: _obscurePassword,
                                    style: TextStyle(color: AppColors.text, fontSize: 15.sp),
                                    decoration: InputDecoration(
                                      hintText: 'Password',
                                      hintStyle: TextStyle(color: AppColors.textSecondary),
                                      prefixIcon: Icon(Icons.lock_rounded, color: AppColors.textSecondary, size: 20.sp),
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                          color: AppColors.textSecondary,
                                          size: 20.sp,
                                        ),
                                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                      ),
                                      border: InputBorder.none,
                                      contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
                                    ),
                                  ),
                                ).animate().slideY(begin: 0.1, delay: 300.ms).fadeIn(),
                                
                                SizedBox(height: 12.h),
                                
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: TextButton(
                                    onPressed: () {},
                                    child: Text('Forgot Password?', style: TextStyle(color: AppColors.accent, fontSize: 13.sp, fontWeight: FontWeight.w600)),
                                  ),
                                ).animate().fadeIn(delay: 400.ms),
                                
                                SizedBox(height: 20.h),
                                
                                ElevatedButton(
                                  onPressed: isLoading ? null : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.accent,
                                    foregroundColor: Colors.white,
                                    padding: EdgeInsets.symmetric(vertical: 18.h),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                                    elevation: 0,
                                  ),
                                  child: isLoading
                                      ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                      : Text('Sign In', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                                ).animate().slideY(begin: 0.1, delay: 500.ms).fadeIn(),
                                
                                SizedBox(height: 20.h),
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
        ],
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
