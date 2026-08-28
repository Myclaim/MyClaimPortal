import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/constants.dart';
import 'package:provider/provider.dart';
import '../providers/dashboard_provider.dart';

class ClaimsScreen extends StatefulWidget {
  const ClaimsScreen({super.key});

  @override
  State<ClaimsScreen> createState() => _ClaimsScreenState();
}

class _ClaimsScreenState extends State<ClaimsScreen> {
  String _filter = 'All';
  final _filters = ['All', 'Active', 'In Progress', 'Pending', 'Completed'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchClaims();
    });
  }

  Future<void> _fetchClaims() async {
    await context.read<DashboardProvider>().fetchDashboard();
  }

  List<dynamic> get _filtered {
    final dash = context.watch<DashboardProvider>();
    final allClaims = dash.claims.isEmpty 
      ? [
          {'companyName': 'Reliance Industries Ltd', 'status': 'Active', 'shares': '150', 'estValue': '₹4,50,000', 'progress': 75},
          {'companyName': 'Tata Consultancy Services', 'status': 'In Progress', 'shares': '50', 'estValue': '₹1,75,000', 'progress': 40},
          {'companyName': 'HDFC Bank', 'status': 'Pending', 'shares': '200', 'estValue': '₹3,20,000', 'progress': 10},
        ] 
      : dash.claims;
    if (_filter == 'All') return allClaims;
    return allClaims.where((c) {
      final s = c['status'].toString().toLowerCase();
      if (_filter == 'Active') return s == 'active';
      if (_filter == 'In Progress') return s.contains('progress');
      if (_filter == 'Pending') return s.contains('pending');
      if (_filter == 'Completed') return s.contains('completed');
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: Column(
        children: [
          // ── Gradient Header ─────────────────────────
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.greenGradient,
            ),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 20.h),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'My Claims',
                            style: GoogleFonts.poppins(
                              fontSize: 22.sp, fontWeight: FontWeight.w800, color: Colors.white,
                            ),
                          ),
                          Text(
                            'All company claims linked to your account',
                            style: GoogleFonts.poppins(
                              fontSize: 12.sp, color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

            SizedBox(height: 14.h),

            // ── Filter Chips ────────────────────────────
            SizedBox(
              height: 36,
              child: ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                scrollDirection: Axis.horizontal,
                itemCount: _filters.length,
                separatorBuilder: (_, __) => SizedBox(width: 8.w),
                itemBuilder: (_, i) {
                  final isActive = _filter == _filters[i];
                  return GestureDetector(
                    onTap: () => setState(() => _filter = _filters[i]),
                    child: AnimatedContainer(
                      duration: Duration(milliseconds: 200),
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        color: isActive ? AppColors.primary : context.surfaceColor,
                        borderRadius: BorderRadius.circular(99.r),
                        border: Border.all(
                          color: isActive ? AppColors.primary : context.borderColor,
                          width: 1,
                        ),
                      ),
                      child: Text(
                        _filters[i],
                        style: TextStyle(
                          fontSize: 12.sp, fontWeight: FontWeight.w700,
                          color: isActive ? Colors.white : context.textSecondaryColor,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            SizedBox(height: 4.h),

            // ── Stats row ────────────────────────────────
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
              child: Row(
                children: [
                  Text('${_filtered.length} claims', style: TextStyle(fontSize: 12.sp, color: context.textSecondaryColor, fontWeight: FontWeight.w600)),
                  Spacer(),
                  Text('Sort by: Recent', style: TextStyle(fontSize: 12.sp, color: AppColors.accent, fontWeight: FontWeight.w700)),
                ],
              ),
            ),

            // ── Claims List ──────────────────────────────
            Expanded(
              child: context.watch<DashboardProvider>().isLoading
                  ? Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : RefreshIndicator(
                      color: AppColors.primary,
                      backgroundColor: context.surfaceColor,
                      onRefresh: _fetchClaims,
                      child: _filtered.isEmpty
                          ? ListView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              children: [
                                SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                                _buildEmpty(),
                              ],
                            )
                          : ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: EdgeInsets.symmetric(horizontal: 16.w),
                              itemCount: _filtered.length,
                              itemBuilder: (_, i) => Padding(
                                padding: EdgeInsets.only(bottom: 10),
                                child: _ClaimCard(
                                  claim: _filtered[i],
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => ClaimDetailScreen(claim: _filtered[i])),
                                  ),
                                ).animate(delay: Duration(milliseconds: i * 80)).fade().slideY(begin: 0.05),
                              ),
                            ),
                    ),
            ),
          ],
        ),
      );
  }

  void _showNewClaimSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => const _NewClaimSheet(),
    );
  }

  Widget _buildEmpty() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('📭', style: TextStyle(fontSize: 52.sp)),
        SizedBox(height: 16.h),
        Text('No claims found', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: context.textColor)),
        SizedBox(height: 6.h),
        Text('Try a different filter above', style: TextStyle(fontSize: 13.sp, color: context.textSecondaryColor)),
      ],
    );
  }
}

class _ClaimCard extends StatelessWidget {
  final dynamic claim;
  final VoidCallback onTap;
  const _ClaimCard({required this.claim, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final status = claim['status'] as String? ?? '';
    final progress = (claim['progress'] as num?)?.toInt() ?? 0;
    final lower = status.toLowerCase();
    final isActive = lower == 'active';
    final isPending = lower.contains('pending');
    final isInProgress = lower.contains('progress');
    
    // Aesthetic colors based on status
    final orbColor = isPending
        ? const Color(0xFF94A3B8) // Grey (Slate 400)
        : isActive
            ? const Color(0xFF10B981) // Emerald Green
            : isInProgress
                ? const Color(0xFFF59E0B) // Amber
                : const Color(0xFF3B82F6); // Blue
    
    final bgGradient = LinearGradient(
      colors: context.isDark 
        ? [orbColor.withValues(alpha: 0.15), orbColor.withValues(alpha: 0.02)]
        : [orbColor.withValues(alpha: 0.08), orbColor.withValues(alpha: 0.01)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
    
    String name = claim['name'] as String? ?? claim['companyName'] as String? ?? '';
    if (name.isEmpty && claim['preIpo'] != null) {
      if (claim['preIpo'] is Map) {
        name = claim['preIpo']['name'] as String? ?? 'Pre-IPO Allocation';
      } else {
        name = 'Pre-IPO Allocation';
      }
    }
    if (name.isEmpty) name = 'Unknown Company';
    
    final initials = name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        decoration: BoxDecoration(
          color: context.isDark ? const Color(0xFF1E293B) : Colors.white,
          gradient: bgGradient,
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: orbColor.withValues(alpha: 0.15), width: 1),
          boxShadow: [
            BoxShadow(
              color: orbColor.withValues(alpha: 0.08),
              blurRadius: 20, offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            // Aesthetic Icon/Initials
            Container(
              width: 50.w, height: 50.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: context.isDark ? Colors.black26 : Colors.white,
                boxShadow: [
                  BoxShadow(color: orbColor.withValues(alpha: 0.2), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Center(
                child: Text(
                  initials.toUpperCase(),
                  style: GoogleFonts.poppins(color: orbColor, fontWeight: FontWeight.w800, fontSize: 16.sp),
                ),
              ),
            ),
            SizedBox(width: 16.w),
            
            // Core Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: GoogleFonts.poppins(fontSize: 15.sp, fontWeight: FontWeight.w700, color: context.textColor),
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4.h),
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                        decoration: BoxDecoration(
                          color: orbColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Text(
                          status.toUpperCase(),
                          style: GoogleFonts.poppins(fontSize: 9.sp, fontWeight: FontWeight.w700, color: orbColor),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Text(
                        '•  ${claim['shares']?.toString() ?? claim['quantity']?.toString() ?? '0'} Shares/Units',
                        style: GoogleFonts.poppins(fontSize: 11.sp, color: context.textSecondaryColor, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            SizedBox(width: 12.w),
            
            // Value & Arrow
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  claim['estValue']?.toString() ?? (claim['totalAmount'] != null ? '₹${claim['totalAmount']}' : '---'),
                  style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w800, color: context.textColor),
                ),
                SizedBox(height: 6.h),
                Container(
                  padding: EdgeInsets.all(6.w),
                  decoration: BoxDecoration(
                    color: context.isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.04),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.arrow_forward_ios_rounded, color: context.textColor, size: 10.sp),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}



class _NewClaimSheet extends StatelessWidget {
  const _NewClaimSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(24.r),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text('New Claim Request', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            Spacer(),
            GestureDetector(onTap: () => Navigator.pop(context), child: Icon(Icons.close_rounded, color: context.textSecondaryColor)),
          ]),
          SizedBox(height: 20.h),
          TextField(
            style: TextStyle(color: context.textColor),
            decoration: InputDecoration(hintText: 'Company Name / ISIN', hintStyle: TextStyle(color: context.textSecondaryColor), filled: true, fillColor: context.backgroundColor, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none)),
          ),
          SizedBox(height: 12.h),
          TextField(
            style: TextStyle(color: context.textColor),
            decoration: InputDecoration(hintText: 'Folio Number', hintStyle: TextStyle(color: context.textSecondaryColor), filled: true, fillColor: context.backgroundColor, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none)),
          ),
          SizedBox(height: 20.h),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent, foregroundColor: Colors.white, padding: EdgeInsets.symmetric(vertical: 14.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r))),
            child: Text('Submit Request', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15.sp)),
          )),
          SizedBox(height: 8.h),
        ],
      ),
    );
  }
}

// ── Claim Detail Screen ───────────────────────────────────
class ClaimDetailScreen extends StatelessWidget {
  final dynamic claim;
  const ClaimDetailScreen({super.key, required this.claim});

  @override
  Widget build(BuildContext context) {
    final status = claim['status'] as String? ?? '';
    final progress = claim['progress'] as int? ?? 0;
    final lower = status.toLowerCase();
    final isActive = lower == 'active';
    final isPending = lower.contains('pending');
    final orbColor = isPending ? AppColors.purple : isActive ? AppColors.accent : AppColors.warning;
    final name = claim['name'] as String? ?? claim['companyName'] as String? ?? 'Unknown Company';
    final initials = name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join();

    final steps = [
      {'label': 'Documents Collected', 'date': 'Mar 2, 2026', 'done': true, 'active': false},
      {'label': 'Verification', 'date': 'Mar 5, 2026', 'done': true, 'active': false},
      {'label': 'Application Filed', 'date': 'Mar 8, 2026', 'done': isActive || progress > 60, 'active': false},
      {'label': 'Authority Review', 'date': isActive ? 'In Progress' : '', 'done': false, 'active': isActive},
      {'label': 'Claim Approved', 'date': '', 'done': false, 'active': false},
      {'label': 'Shares Credited', 'date': '', 'done': false, 'active': false},
    ];

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
              decoration: BoxDecoration(color: context.surfaceColor, border: Border(bottom: BorderSide(color: context.borderColor, width: 1))),
              child: Row(children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(width: 38, height: 38, decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12.r)), child: Icon(Icons.arrow_back_ios_new_rounded, color: context.textColor, size: 16.sp)),
                ),
                SizedBox(width: 12.w),
                Expanded(child: Text(name, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: context.textColor), overflow: TextOverflow.ellipsis)),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: orbColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Text(
                    status.toUpperCase(),
                    style: GoogleFonts.poppins(fontSize: 10.sp, fontWeight: FontWeight.w700, color: orbColor),
                  ),
                ),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(16.r),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Company Header Card
                    Container(
                      padding: EdgeInsets.all(16.r),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [orbColor.withValues(alpha: 0.15), Colors.transparent], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(18.r),
                        border: Border.all(color: orbColor.withValues(alpha: 0.2), width: 1),
                      ),
                      child: Column(
                        children: [
                          Row(children: [
                            Container(
                              width: 52, height: 52,
                              decoration: BoxDecoration(gradient: LinearGradient(colors: [orbColor.withValues(alpha: 0.3), orbColor.withValues(alpha: 0.08)]), borderRadius: BorderRadius.circular(16.r)),
                              child: Center(child: Text(initials, style: TextStyle(color: orbColor, fontWeight: FontWeight.w900, fontSize: 18.sp))),
                            ),
                            SizedBox(width: 14.w),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(name, style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: context.textColor, letterSpacing: -0.5)),
                              Text(claim['isin'] ?? 'N/A', style: TextStyle(fontSize: 11.sp, color: context.textSecondaryColor)),
                            ])),
                            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                              Text('$progress%', style: TextStyle(fontSize: 22.sp, fontWeight: FontWeight.w900, color: orbColor)),
                              Text('Complete', style: TextStyle(fontSize: 10.sp, color: context.textSecondaryColor)),
                            ]),
                          ]),
                          SizedBox(height: 14.h),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(99.r),
                            child: LinearProgressIndicator(value: progress / 100, minHeight: 6, backgroundColor: context.borderColor, valueColor: AlwaysStoppedAnimation(orbColor)),
                          ),
                          SizedBox(height: 14.h),
                          Row(children: [
                            _QuickStat(
                              label: 'Shares/Units', 
                              value: claim['shares']?.toString() ?? claim['quantity']?.toString() ?? 'N/A',
                              color: context.textColor
                            ),
                            SizedBox(width: 10.w),
                            _QuickStat(
                              label: 'Est. Value', 
                              value: claim['estValue']?.toString() ?? (claim['totalAmount'] != null ? '₹${claim['totalAmount']}' : 'N/A'),
                              color: AppColors.accent
                            ),
                          ]),
                        ],
                      ),
                    ).animate().fade().slideY(begin: 0.1),

                    SizedBox(height: 20.h),

                    // Progress Timeline
                    Text('Claim Progress Timeline', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: context.textColor)).animate(delay: 100.ms).fade(),
                    SizedBox(height: 12.h),
                    Container(
                      padding: EdgeInsets.all(16.r),
                      decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16.r), border: Border.all(color: context.borderColor)),
                      child: Column(
                        children: steps.asMap().entries.map((e) {
                          final s = e.value;
                          final isDone = s['done'] as bool;
                          final isCurrentlyActive = s['active'] as bool;
                          final dotColor = isDone ? AppColors.accent : isCurrentlyActive ? orbColor : context.textSecondaryColor.withValues(alpha: 0.3);
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(children: [
                                Container(
                                  width: 28, height: 28,
                                  decoration: BoxDecoration(
                                    color: isDone ? AppColors.accent.withValues(alpha: 0.2) : isCurrentlyActive ? orbColor.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.04),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: dotColor, width: 2),
                                  ),
                                  child: Center(child: isDone
                                      ? Icon(Icons.check_rounded, color: AppColors.accent, size: 14.sp)
                                      : isCurrentlyActive
                                          ? Icon(Icons.access_time_rounded, color: orbColor, size: 12.sp)
                                          : SizedBox()),
                                ),
                                if (e.key < steps.length - 1)
                                  Container(width: 2, height: 32, color: isDone ? AppColors.accent.withValues(alpha: 0.4) : context.borderColor),
                              ]),
                              SizedBox(width: 14.w),
                              Expanded(
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: e.key < steps.length - 1 ? 20 : 0, top: 4),
                                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(s['label'] as String, style: TextStyle(fontSize: 13.sp, fontWeight: isCurrentlyActive ? FontWeight.w800 : FontWeight.w600, color: isDone ? context.textColor : isCurrentlyActive ? orbColor : context.textSecondaryColor)),
                                    if ((s['date'] as String).isNotEmpty) ...[
                                      SizedBox(height: 2.h),
                                      Text(s['date'] as String, style: TextStyle(fontSize: 10.sp, color: isCurrentlyActive ? orbColor : context.textSecondaryColor, fontWeight: FontWeight.w600)),
                                    ],
                                  ]),
                                ),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ).animate(delay: 150.ms).fade().slideY(begin: 0.1),

                    SizedBox(height: 20.h),

                    // Admin Updates
                    Text('Admin Updates', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: context.textColor)).animate(delay: 200.ms).fade(),
                    SizedBox(height: 12.h),
                    Container(
                      decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16.r), border: Border.all(color: context.borderColor)),
                      child: Column(
                        children: [
                          _UpdateRow(icon: '🔵', text: 'Documents verified successfully by admin team', by: 'Admin · Mar 3, 9:15 PM', isLast: false),
                          _UpdateRow(icon: '🔵', text: 'IEPF-5 form submitted to authority portal', by: 'System · Mar 10, 11:00 AM', isLast: false),
                          _UpdateRow(icon: '✅', text: 'Application acknowledged by IEPF Authority', by: 'Admin · Mar 12, 8:40 PM', isLast: true),
                        ],
                      ),
                    ).animate(delay: 250.ms).fade().slideY(begin: 0.1),

                    SizedBox(height: 20.h),

                    // Action Buttons
                    if (isPending)
                      SizedBox(width: double.infinity, child: ElevatedButton.icon(
                        onPressed: () {},
                        icon: Icon(Icons.upload_rounded),
                        label: Text('Upload Required Documents', style: TextStyle(fontWeight: FontWeight.w800)),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning, foregroundColor: Colors.white, padding: EdgeInsets.symmetric(vertical: 14.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r))),
                      )).animate(delay: 300.ms).fade()
                    else
                      SizedBox(width: double.infinity, child: ElevatedButton.icon(
                        onPressed: () {},
                        icon: Icon(Icons.folder_rounded),
                        label: Text('View Documents', style: TextStyle(fontWeight: FontWeight.w800)),
                        style: ElevatedButton.styleFrom(backgroundColor: context.surfaceColor, foregroundColor: context.textColor, padding: EdgeInsets.symmetric(vertical: 14.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r), side: BorderSide(color: context.borderColor))),
                      )).animate(delay: 300.ms).fade(),

                    SizedBox(height: 20.h),
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

class _QuickStat extends StatelessWidget {
  final String label, value;
  final Color color;
  const _QuickStat({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(child: Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 8.h),
      decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10.r)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: TextStyle(fontSize: 9.sp, color: context.textSecondaryColor, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
        SizedBox(height: 3.h),
        Text(value, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: color)),
      ]),
    ));
  }
}

class _UpdateRow extends StatelessWidget {
  final String icon, text, by;
  final bool isLast;
  const _UpdateRow({required this.icon, required this.text, required this.by, required this.isLast});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(14.r),
      decoration: BoxDecoration(border: isLast ? null : Border(bottom: BorderSide(color: context.borderColor, width: 1))),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(width: 32, height: 32, decoration: BoxDecoration(color: AppColors.purple.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10.r)), child: Center(child: Text(icon, style: TextStyle(fontSize: 14.sp)))),
        SizedBox(width: 12.w),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(text, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: context.textColor, height: 1.4)),
          SizedBox(height: 3.h),
          Text(by, style: TextStyle(fontSize: 10.sp, color: context.textSecondaryColor, fontWeight: FontWeight.w600)),
        ])),
      ]),
    );
  }
}
