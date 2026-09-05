import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/constants.dart';

class ResourceDetailScreen extends StatelessWidget {
  final String title;
  final String description;
  final String content;
  final IconData icon;

  const ResourceDetailScreen({
    super.key,
    required this.title,
    required this.description,
    required this.content,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: context.textColor),
        title: Text(
          'Resource Guide',
          style: GoogleFonts.inter(
            color: context.textColor,
            fontWeight: FontWeight.bold,
            fontSize: 16.sp,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(24.r),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                border: Border(
                  bottom: BorderSide(color: context.borderColor),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: EdgeInsets.all(16.r),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: AppColors.primary, size: 36.sp),
                  ),
                  SizedBox(height: 20.h),
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 24.sp,
                      fontWeight: FontWeight.w900,
                      color: context.textColor,
                      height: 1.2,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    description,
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      color: context.textSecondaryColor,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            
            // Content Section
            Padding(
              padding: EdgeInsets.all(24.r),
              child: Text(
                content,
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  color: context.textColor.withValues(alpha: 0.85),
                  height: 1.8,
                ),
              ),
            ),
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }
}
