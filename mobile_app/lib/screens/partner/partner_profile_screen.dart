import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';

class PartnerProfileScreen extends StatelessWidget {
  const PartnerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final name = auth.userName;
    final email = auth.userEmail;
    final phone = auth.userPhone;
    final initials = name.trim().isEmpty 
        ? 'P' 
        : name.trim().split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join().toUpperCase();

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text('My Profile',
                  style: GoogleFonts.inter(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w800,
                      color: context.textColor)),
              Text('Your account details',
                  style: GoogleFonts.inter(
                      fontSize: 12.sp, color: AppColors.textSecondary)),
              SizedBox(height: 28.h),

              // Avatar card
              _buildAvatarCard(context, initials, name, email),
              SizedBox(height: 24.h),

              // Info fields
              Text('ACCOUNT INFORMATION',
                  style: GoogleFonts.inter(
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.8)),
              SizedBox(height: 12.h),

              _infoField(context, Icons.person_outline_rounded, 'Full Name', name,
                  const Color(0xFF10B981))
                  .animate().fadeIn(duration: 300.ms, delay: 100.ms).slideX(begin: -0.05),
              SizedBox(height: 10.h),
              _infoField(context, Icons.mail_outline_rounded, 'Email Address', email,
                  const Color(0xFF818CF8))
                  .animate().fadeIn(duration: 300.ms, delay: 150.ms).slideX(begin: -0.05),
              SizedBox(height: 10.h),
              _infoField(context, Icons.phone_outlined, 'Phone Number', phone,
                  AppColors.warning)
                  .animate().fadeIn(duration: 300.ms, delay: 200.ms).slideX(begin: -0.05),
              SizedBox(height: 10.h),
              _infoField(context, Icons.verified_outlined, 'Role', 'Partner',
                  AppColors.primary)
                  .animate().fadeIn(duration: 300.ms, delay: 250.ms).slideX(begin: -0.05),
              SizedBox(height: 32.h),

              // Logout button
              SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton.icon(
                  onPressed: () => _confirmLogout(context),
                  icon: Icon(Icons.logout_rounded, size: 18.sp),
                  label: Text('Sign Out',
                      style: GoogleFonts.inter(
                          fontSize: 15.sp, fontWeight: FontWeight.w700)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error.withValues(alpha: 0.12),
                    foregroundColor: AppColors.error,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14.r),
                      side: BorderSide(color: AppColors.error.withValues(alpha: 0.3)),
                    ),
                  ),
                ),
              ).animate().fadeIn(duration: 300.ms, delay: 350.ms),
              SizedBox(height: 120.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarCard(
      BuildContext context, String initials, String name, String email) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(24.r),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2B837E), Color(0xFF1F6D68)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1F6D68).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 64.w,
            height: 64.w,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
              border: Border.all(
                  color: Colors.white.withValues(alpha: 0.3), width: 2),
            ),
            child: Center(
              child: Text(initials,
                  style: GoogleFonts.inter(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w800,
                      color: Colors.white)),
            ),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: GoogleFonts.inter(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w800,
                        color: Colors.white)),
                SizedBox(height: 4.h),
                Text(email,
                    style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        color: Colors.white.withValues(alpha: 0.7)),
                    overflow: TextOverflow.ellipsis),
                SizedBox(height: 8.h),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20.r),
                    border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified_rounded,
                          color: AppColors.primary, size: 11.sp),
                      SizedBox(width: 4.w),
                      Text('Verified Partner',
                          style: GoogleFonts.inter(
                              fontSize: 10.sp,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.06);
  }

  Widget _infoField(
      BuildContext context, IconData icon, String label, String value, Color color) {
    return Container(
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 42.w,
            height: 42.w,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: color.withValues(alpha: 0.2)),
            ),
            child: Icon(icon, color: color, size: 20.sp),
          ),
          SizedBox(width: 14.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(),
                    style: GoogleFonts.inter(
                        fontSize: 9.sp,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                        letterSpacing: 0.8)),
                SizedBox(height: 4.h),
                Text(value,
                    style: GoogleFonts.inter(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w700,
                        color: context.textColor),
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
        title: Text('Sign Out',
            style: GoogleFonts.inter(
                fontWeight: FontWeight.w800, color: context.textColor)),
        content: Text('Are you sure you want to sign out?',
            style: GoogleFonts.inter(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel',
                style: GoogleFonts.inter(
                    color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthProvider>().logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.r)),
            ),
            child: Text('Sign Out',
                style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
