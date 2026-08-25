import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/theme.dart';
import '../../utils/constants.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedCategory = 'General Inquiry';
  final _subjectController = TextEditingController();
  final _descController = TextEditingController();

  final _categories = [
    'General Inquiry',
    'Claim Status Update',
    'Document Help',
    'Payment Issue',
    'Technical Support'
  ];

  @override
  void dispose() {
    _subjectController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _submitTicket() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Support ticket submitted successfully!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.surfaceColor,
      appBar: AppBar(
        title: Text('Help & Support', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: context.surfaceColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24.r),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How can we help?',
                style: GoogleFonts.poppins(
                  fontSize: 24.sp,
                  fontWeight: FontWeight.w800,
                  color: context.textColor,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'Create a support ticket and our team will get back to you shortly.',
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  color: context.textSecondaryColor,
                ),
              ),
              SizedBox(height: 32.h),

              Text('Category', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14.sp)),
              SizedBox(height: 12.h),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                decoration: BoxDecoration(
                  color: context.isDark ? Color(0xFF1E293B) : Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16.r),
                  border: Border.all(color: context.borderColor),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedCategory,
                    isExpanded: true,
                    dropdownColor: context.surfaceColor,
                    items: _categories.map((type) {
                      return DropdownMenuItem(value: type, child: Text(type, style: GoogleFonts.inter(fontSize: 14.sp)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                ),
              ),

              SizedBox(height: 24.h),

              Text('Subject', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14.sp)),
              SizedBox(height: 12.h),
              TextFormField(
                controller: _subjectController,
                style: GoogleFonts.inter(fontSize: 14.sp),
                decoration: InputDecoration(
                  hintText: 'Brief subject of your issue...',
                  hintStyle: GoogleFonts.inter(color: context.textSecondaryColor),
                  filled: true,
                  fillColor: context.isDark ? Color(0xFF1E293B) : Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16.r),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16.r),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16.r),
                    borderSide: BorderSide(color: AppColors.primary),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) return 'Please enter a subject';
                  return null;
                },
              ),

              SizedBox(height: 24.h),

              Text('Message', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14.sp)),
              SizedBox(height: 12.h),
              TextFormField(
                controller: _descController,
                maxLines: 5,
                style: GoogleFonts.inter(fontSize: 14.sp),
                decoration: InputDecoration(
                  hintText: 'Describe your issue in detail...',
                  hintStyle: GoogleFonts.inter(color: context.textSecondaryColor),
                  filled: true,
                  fillColor: context.isDark ? Color(0xFF1E293B) : Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16.r),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16.r),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16.r),
                    borderSide: BorderSide(color: AppColors.primary),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) return 'Please enter a message';
                  return null;
                },
              ),

              SizedBox(height: 48.h),

              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: _submitTicket,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Submit Ticket',
                    style: GoogleFonts.poppins(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
