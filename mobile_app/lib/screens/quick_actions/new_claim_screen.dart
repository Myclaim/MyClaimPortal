import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/theme.dart';
import '../../utils/constants.dart';

class NewClaimScreen extends StatefulWidget {
  const NewClaimScreen({super.key});

  @override
  State<NewClaimScreen> createState() => _NewClaimScreenState();
}

class _NewClaimScreenState extends State<NewClaimScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedType = 'IEPF Claim';
  final _descController = TextEditingController();

  final _claimTypes = [
    'IEPF Claim',
    'Transmission of Shares',
    'Duplicate Share Certificate',
    'Change of Name',
    'Signature Mismatch'
  ];

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  void _submitClaim() {
    if (_formKey.currentState!.validate()) {
      // In a real app, this would call the API
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Claim request submitted successfully!'),
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
        title: Text('New Claim', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
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
                'Start a New Claim',
                style: GoogleFonts.poppins(
                  fontSize: 24.sp,
                  fontWeight: FontWeight.w800,
                  color: context.textColor,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'Please provide details about your claim so our team can assist you properly.',
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  color: context.textSecondaryColor,
                ),
              ),
              SizedBox(height: 32.h),

              Text('Claim Type', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14.sp)),
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
                    value: _selectedType,
                    isExpanded: true,
                    dropdownColor: context.surfaceColor,
                    items: _claimTypes.map((type) {
                      return DropdownMenuItem(value: type, child: Text(type, style: GoogleFonts.inter(fontSize: 14.sp)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedType = val);
                    },
                  ),
                ),
              ),

              SizedBox(height: 24.h),

              Text('Description', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14.sp)),
              SizedBox(height: 12.h),
              TextFormField(
                controller: _descController,
                maxLines: 5,
                style: GoogleFonts.inter(fontSize: 14.sp),
                decoration: InputDecoration(
                  hintText: 'Briefly describe your issue or what you need help with...',
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
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
              ),

              SizedBox(height: 48.h),

              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: _submitClaim,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Submit Request',
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
