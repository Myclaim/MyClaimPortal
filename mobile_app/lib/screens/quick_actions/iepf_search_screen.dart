import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/theme.dart';
import '../../utils/constants.dart';

class IepfSearchScreen extends StatefulWidget {
  const IepfSearchScreen({super.key});

  @override
  State<IepfSearchScreen> createState() => _IepfSearchScreenState();
}

class _IepfSearchScreenState extends State<IepfSearchScreen> {
  final _searchController = TextEditingController();
  bool _isLoading = false;
  List<Map<String, String>> _results = [];
  bool _hasSearched = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isLoading = true;
      _hasSearched = true;
    });

    // Simulate API delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock data based on query
    setState(() {
      _isLoading = false;
      _results = [
        {
          'company': 'Reliance Industries Ltd',
          'folio': 'RIL1002345',
          'amount': '₹45,000',
          'status': 'Eligible for Claim'
        },
        {
          'company': 'Tata Consultancy Services',
          'folio': 'TCS559283',
          'amount': '₹12,500',
          'status': 'Eligible for Claim'
        }
      ].where((r) => r['company']!.toLowerCase().contains(query.toLowerCase()) || r['folio']!.toLowerCase().contains(query.toLowerCase())).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.surfaceColor,
      appBar: AppBar(
        title: Text('IEPF Search', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: context.surfaceColor,
        elevation: 0,
      ),
      body: Padding(
        padding: EdgeInsets.all(24.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Find Unclaimed Shares',
              style: GoogleFonts.poppins(
                fontSize: 24.sp,
                fontWeight: FontWeight.w800,
                color: context.textColor,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Search the IEPF database by Company Name or Folio Number to see if you have unclaimed dividends or shares.',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: context.textSecondaryColor,
              ),
            ),
            SizedBox(height: 32.h),

            // Search Bar
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    style: GoogleFonts.inter(fontSize: 14.sp),
                    decoration: InputDecoration(
                      hintText: 'e.g. Reliance or RIL1002...',
                      hintStyle: GoogleFonts.inter(color: context.textSecondaryColor),
                      filled: true,
                      fillColor: context.isDark ? Color(0xFF1E293B) : Color(0xFFF8FAFC),
                      prefixIcon: Icon(Icons.search, color: context.textSecondaryColor),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16.r),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _performSearch(),
                  ),
                ),
                SizedBox(width: 12.w),
                GestureDetector(
                  onTap: _performSearch,
                  child: Container(
                    padding: EdgeInsets.all(16.r),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                    child: _isLoading 
                      ? SizedBox(width: 20.w, height: 20.w, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Icon(Icons.arrow_forward, color: Colors.white, size: 20.w),
                  ),
                ),
              ],
            ),

            SizedBox(height: 32.h),

            // Results Section
            if (_hasSearched && !_isLoading && _results.isEmpty)
              Expanded(
                child: Center(
                  child: Text(
                    'No results found for "${_searchController.text}"',
                    style: GoogleFonts.inter(color: context.textSecondaryColor),
                  ),
                ),
              ),

            if (_hasSearched && !_isLoading && _results.isNotEmpty)
              Expanded(
                child: ListView.builder(
                  itemCount: _results.length,
                  itemBuilder: (context, index) {
                    final item = _results[index];
                    return Container(
                      margin: EdgeInsets.only(bottom: 16.h),
                      padding: EdgeInsets.all(20.r),
                      decoration: BoxDecoration(
                        color: context.isDark ? Color(0xFF1E293B) : Colors.white,
                        borderRadius: BorderRadius.circular(20.r),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: Offset(0, 4),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  item['company']!,
                                  style: GoogleFonts.poppins(
                                    fontSize: 16.sp,
                                    fontWeight: FontWeight.w700,
                                    color: context.textColor,
                                  ),
                                ),
                              ),
                              Container(
                                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                                decoration: BoxDecoration(
                                  color: Colors.green.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8.r),
                                ),
                                child: Text(
                                  item['status']!,
                                  style: GoogleFonts.inter(
                                    fontSize: 10.sp,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.green,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 12.h),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Folio Number', style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
                                  Text(item['folio']!, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: context.textColor)),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text('Est. Value', style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
                                  Text(item['amount']!, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(height: 20.h),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Starting claim process...')));
                              },
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: AppColors.primary),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                              ),
                              child: Text('Start Claim for this Folio', style: GoogleFonts.poppins(color: AppColors.primary, fontWeight: FontWeight.w600)),
                            ),
                          )
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
