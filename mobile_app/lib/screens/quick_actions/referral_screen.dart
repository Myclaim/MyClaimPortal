import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import '../../utils/theme.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class ReferralScreen extends StatefulWidget {
  const ReferralScreen({super.key});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> {
  final _emailController = TextEditingController();
  String _referralCode = 'MYCLAIM2026';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCode();
  }

  Future<void> _fetchCode() async {
    final profile = await ApiService.getClientProfile();
    if (mounted && profile != null) {
      setState(() {
        _referralCode = profile['data']?['referralCode'] ?? 'MYCLAIM2026';
        _isLoading = false;
      });
    } else if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _copyCode() {
    Clipboard.setData(ClipboardData(text: _referralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Referral code copied to clipboard!'),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _sendInvite() {
    if (_emailController.text.trim().isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Invite sent to ${_emailController.text}!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
      _emailController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.surfaceColor,
      appBar: AppBar(
        title: Text('Refer a Friend', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: context.surfaceColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 20.h),
            // Illustration placeholder
            Container(
              width: 160.w,
              height: 160.w,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(Icons.card_giftcard_rounded, size: 80.w, color: AppColors.primary),
              ),
            ),
            
            SizedBox(height: 32.h),
            Text(
              'Invite Friends & Earn',
              style: GoogleFonts.poppins(
                fontSize: 24.sp,
                fontWeight: FontWeight.w800,
                color: context.textColor,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Share your unique code with friends. When they sign up and complete a claim, you both get rewards!',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: context.textSecondaryColor,
                height: 1.5,
              ),
            ),

            SizedBox(height: 48.h),

            // Referral Code Box
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(24.r),
              decoration: BoxDecoration(
                color: context.isDark ? Color(0xFF1E293B) : Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(color: context.borderColor, style: BorderStyle.solid, width: 2),
              ),
              child: Column(
                children: [
                  Text('YOUR REFERRAL CODE', style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.bold, color: context.textSecondaryColor, letterSpacing: 1.5)),
                  SizedBox(height: 12.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _referralCode,
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 28.sp,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          letterSpacing: 2.0,
                        ),
                      ),
                      SizedBox(width: 16.w),
                      IconButton(
                        onPressed: _copyCode,
                        icon: Icon(Icons.copy_rounded, color: AppColors.primary),
                        tooltip: 'Copy Code',
                      ),
                    ],
                  ),
                ],
              ),
            ),

            SizedBox(height: 48.h),

            // Send Invite
            Text('Or send them a direct invite:', style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w500, color: context.textColor)),
            SizedBox(height: 16.h),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      hintText: 'Enter email address...',
                      filled: true,
                      fillColor: context.isDark ? Color(0xFF1E293B) : Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16.r),
                        borderSide: BorderSide(color: context.borderColor),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                    ),
                  ),
                ),
                SizedBox(width: 12.w),
                SizedBox(
                  height: 54.h,
                  child: ElevatedButton(
                    onPressed: _sendInvite,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                    ),
                    child: Text('Send', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
