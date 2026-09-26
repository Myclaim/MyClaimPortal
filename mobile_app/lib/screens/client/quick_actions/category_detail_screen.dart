import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../utils/constants.dart';
import 'free_iepf_report_screen.dart';
import 'new_client_screen.dart';

class CategoryDetailScreen extends StatelessWidget {
  final Map<String, dynamic> category;

  const CategoryDetailScreen({super.key, required this.category});

  IconData _getIconData(String? iconName) {
    switch (iconName) {
      case 'swap_horiz_rounded':
      case 'swap_horiz':
        return Icons.swap_horiz_rounded;
      case 'file_copy_rounded':
      case 'file_copy':
        return Icons.file_copy_rounded;
      case 'manage_accounts_rounded':
      case 'manage_accounts':
        return Icons.manage_accounts_rounded;
      case 'account_balance_rounded':
      case 'account_balance':
      default:
        return Icons.account_balance_rounded;
    }
  }

  Color _parseColor(dynamic colorValue, Color fallback) {
    if (colorValue is Color) return colorValue;
    if (colorValue is String && colorValue.isNotEmpty) {
      try {
        final hexStr = colorValue.replaceAll('#', '').replaceAll('0x', '').replaceAll('0X', '');
        final intVal = int.parse(hexStr, radix: 16);
        if (hexStr.length <= 6) {
          return Color(intVal | 0xFF000000);
        }
        return Color(intVal);
      } catch (_) {}
    }
    return fallback;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;

    final String name = category['name'] ?? 'Service Category';
    final String tag = category['tag'] ?? 'Official Recovery';
    final String description = category['description'] ??
        'Comprehensive advisory and filing services to recover your financial assets.';
    final String stats = category['stats'] ?? '100% Legal Backing';
    final String estimatedTime = category['estimatedTime'] ?? '30 - 60 Days';
    final String actionLabel = category['actionLabel'] ?? 'Apply Now';
    final String serviceMapping = category['serviceMapping'] ?? '';

    final Color themeColor = _parseColor(category['colorHex'] ?? category['iconColor'], AppColors.primary);
    final Color bgLight = _parseColor(category['bgLightHex'] ?? category['bg'], const Color(0xFFEDFDF5));
    final Color bgDark = _parseColor(category['bgDarkHex'] ?? category['bgDark'], const Color(0xFF0D2118));

    final IconData icon = _getIconData(category['icon']?.toString());

    final List<String> steps = category['steps'] != null && (category['steps'] as List).isNotEmpty
        ? List<String>.from(category['steps'])
        : [
            'Eligibility Verification & Document Audit',
            'Legal & RTA Form Preparation',
            'Submission to Authority / Registrar',
            'Coordination & Tracking',
            'Approval & Credit to Demat Account',
          ];

    final List<String> documentsRequired = category['documentsRequired'] != null &&
            (category['documentsRequired'] as List).isNotEmpty
        ? List<String>.from(category['documentsRequired'])
        : [
            'Self-attested PAN Card & Aadhaar Card',
            'Client Master List (CML) of Demat Account',
            'Original Share Certificate / Folio details (if available)',
            'Bank Verification / Cancelled Cheque',
          ];

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
          name.replaceAll('\n', ' '),
          style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w800, color: context.textColor),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
          decoration: BoxDecoration(
            color: context.surfaceColor,
            border: Border(top: BorderSide(color: context.borderColor)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, -3),
              ),
            ],
          ),
          child: Row(
            children: [
              if (name.contains('IEPF')) ...[
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 14.h),
                      side: BorderSide(color: themeColor, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const NewClientScreen(
                            initialService: 'IEPF Claim (Unclaimed Shares & Dividends)',
                          ),
                        ),
                      );
                    },
                    child: Text(
                      'File Inquiry',
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w700,
                        color: themeColor,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12.w),
              ],
              Expanded(
                flex: name.contains('IEPF') ? 2 : 1,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(vertical: 14.h),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                  ),
                  onPressed: () => _handlePrimaryAction(context, name, serviceMapping),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        actionLabel,
                        style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w800),
                      ),
                      SizedBox(width: 8.w),
                      Icon(Icons.arrow_forward_rounded, size: 16.sp, color: Colors.white),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Hero Banner ──────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20.r),
              decoration: BoxDecoration(
                color: isDark ? bgDark : bgLight,
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(color: themeColor.withValues(alpha: 0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: themeColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20.r),
                        ),
                        child: Text(
                          tag.toUpperCase(),
                          style: GoogleFonts.inter(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w800,
                            color: themeColor,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      Container(
                        width: 44.w,
                        height: 44.w,
                        decoration: BoxDecoration(
                          color: themeColor.withValues(alpha: 0.18),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(icon, color: themeColor, size: 22.sp),
                      ),
                    ],
                  ),
                  SizedBox(height: 12.h),
                  Text(
                    name.replaceAll('\n', ' '),
                    style: GoogleFonts.inter(
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w900,
                      color: context.textColor,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    description,
                    style: GoogleFonts.inter(
                      fontSize: 13.sp,
                      color: context.textSecondaryColor,
                      height: 1.5,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Row(
                    children: [
                      _pillBadge(Icons.timer_outlined, estimatedTime, themeColor),
                      SizedBox(width: 10.w),
                      _pillBadge(Icons.verified_outlined, stats, themeColor),
                    ],
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05),

            SizedBox(height: 24.h),

            // ── Step-by-Step Process ──────────────────────────────────
            Text(
              'How It Works',
              style: GoogleFonts.inter(fontSize: 17.sp, fontWeight: FontWeight.w800, color: context.textColor),
            ),
            SizedBox(height: 4.h),
            Text(
              'End-to-end assistance managed by our senior claim attorneys',
              style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor),
            ),
            SizedBox(height: 14.h),

            ...steps.asMap().entries.map((entry) {
              final idx = entry.key + 1;
              final stepText = entry.value;
              return Container(
                margin: EdgeInsets.only(bottom: 12.h),
                padding: EdgeInsets.all(14.r),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(14.r),
                  border: Border.all(color: context.borderColor),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 26.w,
                      height: 26.w,
                      decoration: BoxDecoration(
                        color: themeColor.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$idx',
                        style: GoogleFonts.inter(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w800,
                          color: themeColor,
                        ),
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(
                      child: Text(
                        stepText,
                        style: GoogleFonts.inter(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w600,
                          color: context.textColor,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),

            SizedBox(height: 20.h),

            // ── Required Documents ────────────────────────────────────
            Text(
              'Documents Needed',
              style: GoogleFonts.inter(fontSize: 17.sp, fontWeight: FontWeight.w800, color: context.textColor),
            ),
            SizedBox(height: 4.h),
            Text(
              'Keep these handy or upload them during your claim submission',
              style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor),
            ),
            SizedBox(height: 14.h),

            Container(
              padding: EdgeInsets.all(16.r),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(16.r),
                border: Border.all(color: context.borderColor),
              ),
              child: Column(
                children: documentsRequired.map((doc) {
                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 6.h),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.check_circle_rounded, size: 18.sp, color: themeColor),
                        SizedBox(width: 10.w),
                        Expanded(
                          child: Text(
                            doc,
                            style: GoogleFonts.inter(
                              fontSize: 13.sp,
                              color: context.textColor,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),

            SizedBox(height: 24.h),

            // ── Need Guidance Banner ──────────────────────────────────
            Container(
              padding: EdgeInsets.all(16.r),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [themeColor.withValues(alpha: 0.12), themeColor.withValues(alpha: 0.04)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16.r),
                border: Border.all(color: themeColor.withValues(alpha: 0.25)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(10.r),
                    decoration: BoxDecoration(
                      color: themeColor.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.support_agent_rounded, color: themeColor, size: 24.sp),
                  ),
                  SizedBox(width: 14.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Have questions before applying?',
                          style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          'Our advisors will verify your documents for free before proceeding.',
                          style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }

  Widget _pillBadge(IconData icon, String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(10.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14.sp, color: color),
          SizedBox(width: 5.w),
          Text(
            label,
            style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w700, color: color),
          ),
        ],
      ),
    );
  }

  void _handlePrimaryAction(BuildContext context, String name, String serviceMapping) {
    if (name.contains('IEPF')) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const FreeIepfReportScreen()),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => NewClientScreen(
            initialService: serviceMapping.isNotEmpty ? serviceMapping : null,
          ),
        ),
      );
    }
  }
}
