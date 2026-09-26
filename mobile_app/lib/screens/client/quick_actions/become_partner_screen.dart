import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../services/api_service.dart';
import '../../../utils/constants.dart';

class BecomePartnerScreen extends StatefulWidget {
  const BecomePartnerScreen({super.key});

  @override
  State<BecomePartnerScreen> createState() => _BecomePartnerScreenState();
}

class _BecomePartnerScreenState extends State<BecomePartnerScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;
  bool _submitted = false;

  final _nameCtrl    = TextEditingController();
  final _emailCtrl   = TextEditingController();
  final _phoneCtrl   = TextEditingController();
  final _regNoCtrl   = TextEditingController();
  final _cityCtrl    = TextEditingController();
  final _aboutCtrl   = TextEditingController();

  String? _profession;
  String? _state;

  static const _professions = [
    'Chartered Accountant (CA)',
    'Company Secretary (CS)',
    'Lawyer / Advocate',
    'Financial Advisor',
    'Insurance Agent',
    'Stock Broker / Dealer',
    'Retired Bank Officer',
    'Other',
  ];

  static const _states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
    'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
    'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
    'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
    'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
    'Ladakh','Puducherry','Chandigarh',
  ];

  // ── Replace with your actual YouTube/Vimeo/Drive video URL ──────────────
  static const _videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose(); _phoneCtrl.dispose();
    _regNoCtrl.dispose(); _cityCtrl.dispose(); _aboutCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    final result = await ApiService.submitPartnerRequest(
      fullName:   _nameCtrl.text.trim(),
      email:      _emailCtrl.text.trim(),
      phone:      _phoneCtrl.text.trim(),
      profession: _profession!,
      regNo:      _regNoCtrl.text.trim(),
      city:       _cityCtrl.text.trim(),
      state:      _state!,
      about:      _aboutCtrl.text.trim(),
    );
    setState(() => _isSubmitting = false);
    if (result['success'] == true) {
      setState(() => _submitted = true);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(result['message'] ?? 'Submission failed'),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: EdgeInsets.all(8.r),
            decoration: BoxDecoration(
              color: context.surfaceColor,
              shape: BoxShape.circle,
              border: Border.all(color: context.borderColor),
            ),
            child: Icon(Icons.arrow_back_rounded, size: 18.sp, color: context.textColor),
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Become a Partner',
          style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w800, color: context.textColor),
        ),
      ),
      body: _submitted ? _buildSuccessView() : _buildFormView(isDark),
    );
  }

  Widget _buildSuccessView() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32.r),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80.w, height: 80.w,
              decoration: BoxDecoration(
                gradient: AppColors.greenGradient,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.check_rounded, color: Colors.white, size: 40.sp),
            ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),
            SizedBox(height: 24.h),
            Text(
              'Request Submitted!',
              style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w900, color: context.textColor),
            ),
            SizedBox(height: 10.h),
            Text(
              'Our team will review your details and reach out within 24–48 hours.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 14.sp, color: context.textSecondaryColor, height: 1.5),
            ),
            SizedBox(height: 32.h),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                ),
                onPressed: () => Navigator.pop(context),
                child: Text('Back to Home', style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15.sp)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormView(bool isDark) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Video Play Card ────────────────────────────────────────────
          _VideoPlayCard(videoUrl: _videoUrl, isDark: isDark)
              .animate().fadeIn(duration: 400.ms).slideY(begin: 0.06),
          SizedBox(height: 20.h),

          // ── Promo Card (stats) ─────────────────────────────────────────
          _PromoCard(isDark: isDark)
              .animate().fadeIn(duration: 400.ms, delay: 80.ms).slideY(begin: 0.06),
          SizedBox(height: 24.h),

          // ── Form ───────────────────────────────────────────────────────
          Text(
            'Join the Partner Network',
            style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w800, color: context.textColor),
          ),
          SizedBox(height: 4.h),
          Text(
            "We'll review your details and reach out within 24–48 hours",
            style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor),
          ),
          SizedBox(height: 20.h),

          Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _label('Full Name', required: true),
                _field(_nameCtrl, hint: 'Your full name', validator: (v) => v!.isEmpty ? 'Required' : null),
                SizedBox(height: 14.h),

                _label('Email Address', required: true),
                _field(_emailCtrl, hint: 'your@email.com', keyboardType: TextInputType.emailAddress,
                    validator: (v) => v!.contains('@') ? null : 'Enter a valid email'),
                SizedBox(height: 14.h),

                _label('Mobile Number', required: true),
                _field(_phoneCtrl, hint: '+91 98765 43210', keyboardType: TextInputType.phone,
                    validator: (v) => v!.length < 10 ? 'Enter a valid number' : null),
                SizedBox(height: 14.h),

                _label('Profession / Role', required: true),
                _dropdown(
                  value: _profession,
                  hint: 'Select your profession',
                  items: _professions,
                  onChanged: (v) => setState(() => _profession = v),
                  validator: (v) => v == null ? 'Please select your profession' : null,
                ),
                SizedBox(height: 14.h),

                _label('Professional Registration No.', required: false),
                _field(_regNoCtrl, hint: 'e.g. ICAI Membership No. 123456'),
                SizedBox(height: 14.h),

                _label('City', required: true),
                _field(_cityCtrl, hint: 'e.g. Mumbai', validator: (v) => v!.isEmpty ? 'Required' : null),
                SizedBox(height: 14.h),

                _label('State', required: true),
                _dropdown(
                  value: _state,
                  hint: 'Select state',
                  items: _states,
                  onChanged: (v) => setState(() => _state = v),
                  validator: (v) => v == null ? 'Please select your state' : null,
                ),
                SizedBox(height: 14.h),

                _label('About Yourself', required: false),
                TextFormField(
                  controller: _aboutCtrl,
                  maxLines: 4,
                  style: GoogleFonts.inter(fontSize: 14.sp, color: context.textColor),
                  decoration: _inputDecoration('Briefly describe your experience and why you\'d like to partner with us...'),
                ),
                SizedBox(height: 28.h),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.black,
                      padding: EdgeInsets.symmetric(vertical: 16.h),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                    ),
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? SizedBox(
                            width: 22.w, height: 22.w,
                            child: const CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                          )
                        : Text(
                            'Submit Request',
                            style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w800),
                          ),
                  ),
                ),
                SizedBox(height: 100.h),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text, {bool required = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 6.h),
      child: Row(
        children: [
          Text(text, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: context.textColor)),
          if (required) ...[
            SizedBox(width: 4.w),
            Text('*', style: TextStyle(color: AppColors.error, fontSize: 13.sp, fontWeight: FontWeight.bold)),
          ] else ...[
            SizedBox(width: 6.w),
            Text('(optional)', style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
          ],
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(fontSize: 13.sp, color: context.textSecondaryColor),
        filled: true,
        fillColor: context.surfaceColor,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: context.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
      );

  Widget _field(TextEditingController ctrl,
      {String? hint, TextInputType? keyboardType, String? Function(String?)? validator}) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      validator: validator,
      style: GoogleFonts.inter(fontSize: 14.sp, color: context.textColor),
      decoration: _inputDecoration(hint ?? ''),
    );
  }

  Widget _dropdown({
    required String? value,
    required String hint,
    required List<String> items,
    required void Function(String?) onChanged,
    String? Function(String?)? validator,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      validator: validator,
      style: GoogleFonts.inter(fontSize: 14.sp, color: context.textColor),
      dropdownColor: context.surfaceColor,
      decoration: _inputDecoration(hint),
      hint: Text(hint, style: GoogleFonts.inter(fontSize: 13.sp, color: context.textSecondaryColor)),
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
      onChanged: onChanged,
    );
  }
}

// ─── Video Play Card ──────────────────────────────────────────────────────────

class _VideoPlayCard extends StatelessWidget {
  final String videoUrl;
  final bool isDark;
  const _VideoPlayCard({required this.videoUrl, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final uri = Uri.parse(videoUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      },
      child: Container(
        width: double.infinity,
        height: 180.h,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20.r),
          gradient: LinearGradient(
            colors: isDark
                ? [const Color(0xFF0D1F12), const Color(0xFF112B1A)]
                : [const Color(0xFFE8FFF0), const Color(0xFFD1FAE5)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
        ),
        child: Stack(
          children: [
            // Decorative circles
            Positioned(
              right: -30, bottom: -30,
              child: Container(
                width: 130.w, height: 130.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.08),
                ),
              ),
            ),
            Positioned(
              left: -20, top: -20,
              child: Container(
                width: 90.w, height: 90.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.06),
                ),
              ),
            ),
            // Content
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Play button
                  Container(
                    width: 60.w, height: 60.w,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppColors.greenGradient,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.4),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(Icons.play_arrow_rounded, color: Colors.white, size: 32.sp),
                  ),
                  SizedBox(height: 12.h),
                  Text(
                    'Watch: How to Become a Partner',
                    style: GoogleFonts.inter(
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : const Color(0xFF065F46),
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    '3 min explainer video',
                    style: GoogleFonts.inter(
                      fontSize: 11.sp,
                      color: isDark
                          ? AppColors.primary.withValues(alpha: 0.8)
                          : const Color(0xFF059669),
                    ),
                  ),
                ],
              ),
            ),
            // Top-left badge
            Positioned(
              top: 12, left: 12,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20.r),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.play_circle_outline_rounded, size: 11.sp, color: AppColors.primary),
                    SizedBox(width: 4.w),
                    Text(
                      'EXPLAINER VIDEO',
                      style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: 0.5),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Promo Stats Card ─────────────────────────────────────────────────────────

class _PromoCard extends StatelessWidget {
  final bool isDark;
  const _PromoCard({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF1A0D26), const Color(0xFF2D1040)]
              : [const Color(0xFF7C3AED), const Color(0xFF5B21B6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF7C3AED).withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tag
          Container(
            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20.r),
              border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.star_rounded, size: 11.sp, color: Colors.white),
                SizedBox(width: 4.w),
                Text(
                  'EARN WITHOUT LIMITS',
                  style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.8),
                ),
              ],
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            'Grow Your Income by Helping\nInvestors Reclaim Their Wealth',
            style: GoogleFonts.inter(fontSize: 17.sp, fontWeight: FontWeight.w900, color: Colors.white, height: 1.25),
          ),
          SizedBox(height: 8.h),
          Text(
            'Join our network of CAs, lawyers, financial advisors and agents. Refer clients, track commissions, and get expert backend support — all from this app.',
            style: GoogleFonts.inter(fontSize: 12.sp, color: Colors.white.withValues(alpha: 0.82), height: 1.5),
          ),
          SizedBox(height: 16.h),
          Row(
            children: [
              _statBox('₹25K+', 'Avg. monthly earnings'),
              SizedBox(width: 10.w),
              _statBox('2,100+', 'Active partners'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statBox(String value, String label) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w900, color: Colors.white)),
            SizedBox(height: 2.h),
            Text(label, style: GoogleFonts.inter(fontSize: 10.sp, color: Colors.white.withValues(alpha: 0.75))),
          ],
        ),
      ),
    );
  }
}
