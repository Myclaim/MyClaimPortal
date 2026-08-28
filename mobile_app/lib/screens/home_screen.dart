import '../services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../utils/constants.dart';
import 'folder_documents_screen.dart';
import 'quick_actions/new_claim_screen.dart';
import 'quick_actions/support_screen.dart';
import 'quick_actions/iepf_search_screen.dart';
import 'quick_actions/family_tree_screen.dart';
import 'quick_actions/referral_screen.dart';
import 'quick_actions/upload_document_screen.dart';
import 'claims_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const HomeScreen({super.key, this.onNavigate});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().fetchDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dash = context.watch<DashboardProvider>();
    final firstName = auth.userName.split(' ').first;

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: context.surfaceColor,
          onRefresh: () => context.read<DashboardProvider>().fetchDashboard(),
          child: dash.isLoading 
              ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
              : SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Top App Bar
                      _buildAppBar(context),
                      SizedBox(height: 24.h),

                      // 2. Welcome Message & Est Recovery
                      _buildWelcomeSection(firstName, dash),
                      SizedBox(height: 16.h),

                      // 3. Stats Dashboard
                      _buildStatsGrid(context, dash),
                      SizedBox(height: 28.h),

                      // NEW WIDGET: Claims & Services
                      _ClaimsAndServicesSection(onNavigate: widget.onNavigate),
                      SizedBox(height: 28.h),

                      // 5. Quick Actions
                      Text(
                        'Quick Actions',
                        style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor),
                      ),
                      SizedBox(height: 12.h),
                      const _QuickActionsRow(),
                      SizedBox(height: 28.h),

                      // 6. Referral Banner
                      const _ReferralBanner(),
                      SizedBox(height: 28.h),

                      // 7. Recent Activity
                      const _RecentActivitySection(),
                      SizedBox(height: 28.h),

                      // 8. Helpful Resources
                      const _HelpfulResourcesSection(),
                      SizedBox(height: 28.h),
                      
                      // 9. Need Help Section
                      const _NeedHelpCard(),
                      
                      SizedBox(height: 120.h), // padding for bottom nav
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(Icons.shield_outlined, color: AppColors.primary, size: 28.sp),
            SizedBox(width: 8.w),
            Text(
              'MyClaim',
              style: GoogleFonts.inter(fontSize: 20.sp, fontWeight: FontWeight.bold, color: context.textColor),
            ),
          ],
        ),
        Row(
          children: [
            IconButton(
              icon: Icon(Icons.notifications_none_rounded, color: context.textColor),
              onPressed: () {},
            ),
            SizedBox(width: 4.w),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ProfileScreen()),
                );
              },
              child: Container(
                width: 36.w,
                height: 36.w,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(Icons.person_outline_rounded, color: context.backgroundColor, size: 20.sp),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWelcomeSection(String name, DashboardProvider dash) {
    double parseEstValue(String valueStr) {
      if (valueStr.isEmpty || valueStr.toLowerCase() == 'n/a' || valueStr == '---') return 0;
      try {
        var cleanStr = valueStr.replaceAll('₹', '').replaceAll(',', '').trim();
        double multiplier = 1.0;
        if (cleanStr.toUpperCase().endsWith('L')) {
          multiplier = 100000.0;
          cleanStr = cleanStr.substring(0, cleanStr.length - 1).trim();
        } else if (cleanStr.toUpperCase().endsWith('K')) {
          multiplier = 1000.0;
          cleanStr = cleanStr.substring(0, cleanStr.length - 1).trim();
        } else if (cleanStr.toUpperCase().endsWith('CR')) {
          multiplier = 10000000.0;
          cleanStr = cleanStr.substring(0, cleanStr.length - 2).trim();
        }
        return double.parse(cleanStr) * multiplier;
      } catch (e) {
        return 0;
      }
    }

    String formatEstValueShort(double val) {
      if (val == 0) return '₹0';
      if (val >= 10000000) return '₹${(val / 10000000).toStringAsFixed(2)}Cr';
      if (val >= 100000) return '₹${(val / 100000).toStringAsFixed(2)}L';
      if (val >= 1000) return '₹${(val / 1000).toStringAsFixed(1)}K';
      return '₹${val.toStringAsFixed(0)}';
    }

    int totalShares = 0;
    double totalEstimatedVal = 0.0;

    for (var ticket in dash.claims) {
      final s = ticket['shares']?.toString() ?? '0';
      totalShares += int.tryParse(s.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
      totalEstimatedVal += parseEstValue(ticket['estValue']?.toString() ?? '');
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back,\n$name 👋',
          style: GoogleFonts.inter(fontSize: 28.sp, fontWeight: FontWeight.w800, color: AppColors.primary, height: 1.2),
        ),
        SizedBox(height: 8.h),
        Text(
          'Let\'s get started on recovering your unclaimed\nassets.',
          style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.textSecondary, height: 1.4),
        ),
        SizedBox(height: 20.h),
        // Premium Teal Dashboard Card
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(20.r),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF2B837E), Color(0xFF1F6D68)], begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1F6D68).withValues(alpha: 0.3),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ESTIMATED PORTFOLIO VALUE',
                style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w600, color: Colors.white70, letterSpacing: 0.5),
              ),
              SizedBox(height: 12.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatEstValueShort(totalEstimatedVal),
                        style: GoogleFonts.inter(fontSize: 32.sp, fontWeight: FontWeight.bold, color: Colors.white, height: 1),
                      ),
                      SizedBox(width: 8.w),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                        margin: EdgeInsets.only(bottom: 4.h),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          '${dash.claims.length} Claims',
                          style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: EdgeInsets.all(10.r),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.15),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 1),
                    ),
                    child: Icon(Icons.account_balance_wallet_outlined, color: Colors.white, size: 24.sp),
                  ),
                ],
              ),
              SizedBox(height: 20.h),
              Text(
                'Total projected value across ${dash.claims.length} active assets.',
                style: GoogleFonts.inter(fontSize: 11.sp, color: Colors.white.withValues(alpha: 0.8)),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05),
      ],
    );
  }

  Widget _buildStatsGrid(BuildContext context, DashboardProvider dash) {
    final overview = dash.overview;
    final total = overview['totalClaims']?.toString() ?? '16';
    final active = int.tryParse(overview['active']?.toString() ?? '0') ?? 0;
    final inProgress = int.tryParse(overview['inProgress']?.toString() ?? '0') ?? 0;
    final completed = int.tryParse(overview['completed']?.toString() ?? '0') ?? 0;

    return Column(
      children: [
        Row(
          children: [
            _buildStatItem(context, 'Total Claims', total),
            SizedBox(width: 12.w),
            _buildStatItem(context, 'Active', active.toString().padLeft(2, '0')),
            SizedBox(width: 12.w),
            _buildStatItem(context, 'In Progress', inProgress.toString().padLeft(2, '0')),
            SizedBox(width: 12.w),
            _buildStatItem(context, 'Completed', completed.toString().padLeft(2, '0'), isHighlight: true),
          ],
        ),
      ],
    ).animate().fadeIn(duration: 400.ms, delay: 100.ms).slideY(begin: 0.05);
  }

  Widget _buildStatItem(BuildContext context, String label, String value, {bool isHighlight = false}) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 8.w),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: context.borderColor, width: 1),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 4.h),
            Text(
              value,
              style: GoogleFonts.inter(
                fontSize: 18.sp, 
                fontWeight: FontWeight.bold, 
                color: isHighlight ? AppColors.primary : context.textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

}

class _ClaimsAndServicesSection extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const _ClaimsAndServicesSection({this.onNavigate});

  @override
  State<_ClaimsAndServicesSection> createState() => _ClaimsAndServicesSectionState();
}

class _ClaimsAndServicesSectionState extends State<_ClaimsAndServicesSection> {
  int _activeTabIndex = 0; // 0 for My Claims, 1 for Services

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Claims & Services',
          style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.bold, color: context.textColor),
        ),
        SizedBox(height: 12.h),
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(20.r),
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: BorderRadius.circular(20.r),
            border: Border.all(color: context.borderColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              // Tabs
              Row(
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _activeTabIndex = 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'My Claims',
                          style: GoogleFonts.inter(
                            fontSize: 14.sp, 
                            fontWeight: _activeTabIndex == 0 ? FontWeight.bold : FontWeight.w500, 
                            color: _activeTabIndex == 0 ? AppColors.primary : context.textSecondaryColor
                          ),
                        ),
                        SizedBox(height: 4.h),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          width: 30.w,
                          height: 3.h,
                          decoration: BoxDecoration(
                            color: _activeTabIndex == 0 ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(2.r),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 24.w),
                  GestureDetector(
                    onTap: () => setState(() => _activeTabIndex = 1),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Services',
                          style: GoogleFonts.inter(
                            fontSize: 14.sp, 
                            fontWeight: _activeTabIndex == 1 ? FontWeight.bold : FontWeight.w500, 
                            color: _activeTabIndex == 1 ? AppColors.primary : context.textSecondaryColor
                          ),
                        ),
                        SizedBox(height: 4.h),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          width: 30.w,
                          height: 3.h,
                          decoration: BoxDecoration(
                            color: _activeTabIndex == 1 ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(2.r),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24.h),
              
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _activeTabIndex == 0
                    ? _buildClaimsTab(context)
                    : _buildServicesTab(context),
              ),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms, delay: 150.ms).slideY(begin: 0.1);
  }

  Widget _buildClaimsTab(BuildContext context) {
    final dash = context.watch<DashboardProvider>();
    final allClaims = dash.claims.isEmpty 
      ? [
          {'companyName': 'ola', 'status': 'active', 'shares': '150', 'estValue': '₹4,50,000', 'progress': 75},
          {'companyName': 'NSE LTD', 'status': 'In Progress', 'shares': '50', 'estValue': '₹1,75,000', 'progress': 40},
          {'companyName': 'Reliance industries limited', 'status': 'In Progress', 'shares': '200', 'estValue': '₹3,20,000', 'progress': 10},
        ] 
      : dash.claims;

    return Column(
      key: const ValueKey('claims'),
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: allClaims.take(3).map((claim) {
            final name = claim['name'] as String? ?? claim['companyName'] as String? ?? 'Unknown';
            final status = claim['status'] as String? ?? '';
            final lower = status.toLowerCase();
            final isActive = lower == 'active';
            final isPending = lower.contains('pending');
            final isInProgress = lower.contains('progress');
            
            final orbColor = isPending
                ? const Color(0xFF94A3B8)
                : isActive
                    ? AppColors.primary
                    : isInProgress
                        ? const Color(0xFFF59E0B)
                        : const Color(0xFF3B82F6);
            
            String initials;
            if (name.toLowerCase().contains('ola')) initials = 'O';
            else if (name.toLowerCase().contains('nse')) initials = 'NL';
            else if (name.toLowerCase().contains('reliance')) initials = 'R';
            else initials = name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();
            
            return Expanded(
              child: Column(
                children: [
                  Container(
                    width: 60.w,
                    height: 60.w,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                    ),
                    child: Center(
                      child: Text(
                        initials,
                        style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ),
                  ),
                  SizedBox(height: 12.h),
                  Text(
                    name,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w600, color: context.textColor, height: 1.3),
                  ),
                  SizedBox(height: 6.h),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                    decoration: BoxDecoration(
                      color: orbColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Text(
                      status,
                      style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.bold, color: orbColor),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
        SizedBox(height: 20.h),
        GestureDetector(
          onTap: () {
            if (widget.onNavigate != null) {
              widget.onNavigate!(1); // 1 is Claims tab
            }
          },
          behavior: HitTestBehavior.opaque,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'View All',
                style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              SizedBox(width: 4.w),
              Icon(Icons.arrow_forward_rounded, color: AppColors.primary, size: 16.sp),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildServicesTab(BuildContext context) {
    return Column(
      key: const ValueKey('services'),
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildServiceIconItem(context, 'IEPF Claim', Icons.assignment_turned_in_outlined),
            _buildServiceIconItem(context, 'Share Transfer', Icons.swap_horiz_rounded),
            _buildServiceIconItem(context, 'KYC Update', Icons.fact_check_outlined),
          ],
        ),
        SizedBox(height: 20.h),
        // More button
        GestureDetector(
          onTap: () {
            if (widget.onNavigate != null) {
              widget.onNavigate!(3); // 3 is Services tab
            }
          },
          behavior: HitTestBehavior.opaque,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'More',
                style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              SizedBox(width: 4.w),
              Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary, size: 18.sp),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildServiceIconItem(BuildContext context, String title, IconData icon) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 60.w,
            height: 60.w,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
            ),
            child: Center(
              child: Icon(icon, color: AppColors.primary, size: 28.sp),
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w600, color: context.textColor, height: 1.3),
          ),
        ],
      ),
    );
  }
}

class _QuickActionsRow extends StatelessWidget {
  const _QuickActionsRow();

  @override
  Widget build(BuildContext context) {
    final actions = [
      {'icon': Icons.upload_file_rounded, 'label': 'Upload Docs', 'highlight': false, 'route': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UploadDocumentScreen()))},
      {'icon': Icons.list_alt_rounded, 'label': 'View Claims', 'highlight': false, 'route': () {}},
      {'icon': Icons.add_circle_outline_rounded, 'label': 'New Claim', 'highlight': true, 'route': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NewClaimScreen()))},
      {'icon': Icons.help_outline_rounded, 'label': 'Support', 'highlight': false, 'route': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()))},
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: actions.map((a) {
        final isHighlight = a['highlight'] as bool;
        return GestureDetector(
          onTap: a['route'] as VoidCallback,
          child: Column(
            children: [
              Container(
                width: 70.w,
                height: 70.w,
                decoration: BoxDecoration(
                  color: isHighlight ? AppColors.primary : context.surfaceColor,
                  borderRadius: BorderRadius.circular(16.r),
                  border: Border.all(color: isHighlight ? AppColors.primary : context.borderColor, width: 1),
                ),
                child: Center(
                  child: Icon(
                    a['icon'] as IconData,
                    color: isHighlight ? context.backgroundColor : AppColors.primary,
                    size: 28.sp,
                  ),
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                a['label'] as String,
                style: GoogleFonts.inter(
                  fontSize: 11.sp,
                  fontWeight: isHighlight ? FontWeight.w600 : FontWeight.w500,
                  color: context.textColor,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    ).animate().fadeIn(duration: 400.ms, delay: 200.ms).slideY(begin: 0.1);
  }
}


class _ReferralBanner extends StatelessWidget {
  const _ReferralBanner();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen())),
      child: Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.r),
      decoration: BoxDecoration(
        gradient: AppColors.greenGradient,
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Refer & Earn ₹500',
                  style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                SizedBox(height: 4.h),
                Text(
                  'Invite friends to recover their lost shares and get processing fee waivers.',
                  style: GoogleFonts.inter(fontSize: 12.sp, color: Colors.white.withValues(alpha: 0.9)),
                ),
              ],
            ),
          ),
          SizedBox(width: 16.w),
          Container(
            padding: EdgeInsets.all(12.r),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.card_giftcard_rounded, color: Colors.white, size: 28.sp),
          )
        ],
      ),
    )).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1);
  }
}


class _RecentActivitySection extends StatelessWidget {
  const _RecentActivitySection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Activity',
          style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor),
        ),
        SizedBox(height: 12.h),
        Container(
          padding: EdgeInsets.symmetric(vertical: 8.h),
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: BorderRadius.circular(16.r),
            border: Border.all(color: context.borderColor),
          ),
          child: FutureBuilder<Map<String, dynamic>?>(
            future: ApiService.getNotifications(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(child: Padding(padding: EdgeInsets.all(16.r), child: CircularProgressIndicator(color: AppColors.primary)));
              }
              
              final data = snapshot.data;
              var notifications = data != null ? data['data'] as List<dynamic>? : null;
              
              if (notifications == null || notifications.isEmpty) {
                // Fallback Mock Data
                notifications = [
                  {'title': 'Claim Initialized', 'message': 'TCS dividend claim processing started', 'date': '2 hours ago'},
                  {'title': 'Documents Verified', 'message': 'Aadhar and PAN verification successful', 'date': '1 day ago'},
                  {'title': 'Support Ticket Resolved', 'message': 'Query regarding IEPF forms answered', 'date': '3 days ago'},
                ];
              }
              
              return Column(
                children: notifications.take(3).map((notif) {
                  final title = notif['title']?.toString() ?? 'Update';
                  final message = notif['message']?.toString() ?? '';
                  final isSuccess = message.toLowerCase().contains('complete') || message.toLowerCase().contains('success');
                  final icon = isSuccess ? Icons.check_circle_outline_rounded : Icons.notifications_active_outlined;
                  
                  return Column(
                    children: [
                      _buildActivityItem(context, title, message, 'Recent', icon, isSuccess: isSuccess),
                      if (notif != notifications!.take(3).last) Divider(color: context.borderColor, height: 1),
                    ],
                  );
                }).toList(),
              );
            },
          ),
        ),
      ],
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1);
  }

  Widget _buildActivityItem(BuildContext context, String title, String subtitle, String time, IconData icon, {bool isSuccess = false}) {
    return ListTile(
      leading: Container(
        padding: EdgeInsets.all(8.r),
        decoration: BoxDecoration(
          color: isSuccess ? AppColors.primary.withValues(alpha: 0.15) : AppColors.surface,
          shape: BoxShape.circle,
          border: Border.all(color: context.borderColor),
        ),
        child: Icon(icon, color: isSuccess ? AppColors.primary : context.textColor, size: 20.sp),
      ),
      title: Text(
        title,
        style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: context.textColor),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor),
      ),
      trailing: Text(
        time,
        style: GoogleFonts.inter(fontSize: 10.sp, color: context.textSecondaryColor),
      ),
    );
  }
}

class _HelpfulResourcesSection extends StatelessWidget {
  const _HelpfulResourcesSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Helpful Resources',
          style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor),
        ),
        SizedBox(height: 12.h),
        SizedBox(
          height: 140.h,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            children: [
              _buildResourceCard(context, 'Understanding IEPF', 'What you need to know before filing.', Icons.menu_book_rounded),
              SizedBox(width: 12.w),
              _buildResourceCard(context, 'Tax Implications', 'How recovered shares affect your taxes.', Icons.account_balance_rounded),
              SizedBox(width: 12.w),
              _buildResourceCard(context, 'Legal Heir guide', 'Documentation for inherited shares.', Icons.family_restroom_rounded),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 700.ms).slideX(begin: 0.1);
  }

  Widget _buildResourceCard(BuildContext context, String title, String desc, IconData icon) {
    return Container(
      width: 220.w,
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 28.sp),
          const Spacer(),
          Text(
            title,
            style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: context.textColor),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 4.h),
          Text(
            desc,
            style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _NeedHelpCard extends StatelessWidget {
  const _NeedHelpCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.r),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(12.r),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.support_agent_rounded, color: AppColors.primary, size: 32.sp),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need Help?',
                  style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor),
                ),
                SizedBox(height: 4.h),
                Text(
                  'Chat with a claim expert for quick assistance.',
                  style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor),
                ),
              ],
            ),
          ),
          SizedBox(width: 12.w),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen())),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20.r),
              ),
              child: Text(
                'Chat Now',
                style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600, color: Colors.white),
              ),
            ),
          )
        ],
      ),
    ).animate().fadeIn(duration: 800.ms).slideY(begin: 0.1);
  }
}
