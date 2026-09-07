import '../../services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../utils/constants.dart';
import 'folder_documents_screen.dart';
import 'quick_actions/new_claim_screen.dart';
import 'quick_actions/support_screen.dart';
import 'quick_actions/iepf_search_screen.dart';
import 'quick_actions/family_tree_screen.dart';
import 'quick_actions/referral_screen.dart';
import 'quick_actions/upload_document_screen.dart';
import 'claims_screen.dart';
import 'profile_screen.dart';
import 'resource_detail_screen.dart';

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
                      _QuickActionsRow(onNavigate: widget.onNavigate),
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
            Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  icon: Icon(Icons.notifications_none_rounded, color: context.textColor),
                  onPressed: () => _showNotificationsSheet(context),
                ),
                Positioned(
                  top: 8.h,
                  right: 8.w,
                  child: Container(
                    padding: EdgeInsets.all(4.r),
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '5',
                      style: TextStyle(color: Colors.white, fontSize: 10.sp, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
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

  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, scrollController) => Column(
          children: [
            Container(
              margin: EdgeInsets.only(top: 12.h, bottom: 8.h),
              width: 40.w,
              height: 4.h,
              decoration: BoxDecoration(color: context.borderColor, borderRadius: BorderRadius.circular(2.r)),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Notifications', style: GoogleFonts.inter(fontSize: 20.sp, fontWeight: FontWeight.bold, color: context.textColor)),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Mark all read', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: FutureBuilder<Map<String, dynamic>?>(
                future: ApiService.getNotifications(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator(color: AppColors.primary));
                  }
                  var notifications = snapshot.data?['data'] as List<dynamic>?;
                  
                  if (notifications == null || notifications.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.r),
                        child: Text(
                          'No new notifications',
                          style: GoogleFonts.inter(fontSize: 14.sp, color: context.textSecondaryColor),
                        ),
                      ),
                    );
                  }

                  return ListView.separated(
                    controller: scrollController,
                    padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                    itemCount: notifications.length,
                    separatorBuilder: (_, __) => Divider(color: context.borderColor, height: 16.h),
                    itemBuilder: (context, index) {
                      final notif = notifications![index];
                      final isComment = notif['type'] == 'comment' || notif['title'].toString().contains('Comment');
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: EdgeInsets.all(10.r),
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isComment ? Icons.chat_bubble_outline_rounded : Icons.trending_up_rounded, 
                              color: AppColors.success, 
                              size: 20.sp
                            ),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(notif['title']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor)),
                                SizedBox(height: 4.h),
                                Text(notif['message']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor, height: 1.4)),
                                SizedBox(height: 6.h),
                                Text(notif['date']?.toString() ?? '', style: GoogleFonts.inter(fontSize: 10.sp, color: context.textSecondaryColor.withValues(alpha: 0.6))),
                              ],
                            ),
                          ),
                        ],
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
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
            gradient: const LinearGradient(colors: [Color(0xFF4ADE80), Color(0xFF22C55E)], begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(20.r),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF22C55E).withValues(alpha: 0.3),
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
    int total = dash.claims.length;
    int active = 0;
    int inProgress = 0;
    int completed = 0;

    for (var claim in dash.claims) {
      final s = (claim['status']?.toString() ?? '').toLowerCase();
      if (s == 'active' || s == 'allocated') {
        active++;
      } else if (s.contains('progress')) {
        inProgress++;
      } else if (s.contains('completed')) {
        completed++;
      }
    }

    return Column(
      children: [
        Row(
          children: [
            _buildStatItem(context, 'Total Claims', total.toString()),
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
            final name = claim['name'] as String? ?? 
                         (claim['preIpo'] != null ? claim['preIpo']['name'] as String? : null) ?? 
                         claim['companyName'] as String? ?? 
                         'Unknown';
            final status = claim['status'] as String? ?? '';
            return _buildItemCard(context, name, status);
          }).toList(),
        ),
        SizedBox(height: 24.h),
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
                style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              SizedBox(width: 4.w),
              Icon(Icons.arrow_forward_rounded, color: AppColors.primary, size: 18.sp),
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
            _buildItemCard(context, 'IEPF Claim', 'completed'),
            _buildItemCard(context, 'Share Transfer', 'pending'),
            _buildItemCard(context, 'KYC Update', 'in-progress'),
          ],
        ),
        SizedBox(height: 24.h),
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
                'View All',
                style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              SizedBox(width: 4.w),
              Icon(Icons.arrow_forward_rounded, color: AppColors.primary, size: 18.sp),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemCard(BuildContext context, String name, String status) {
    final lower = status.toLowerCase();
    final isSuccess = lower == 'completed' || lower == 'active';
    final isPending = lower.contains('pending');
    final isInProgress = lower.contains('progress');
    
    // Status text format
    String displayStatus = status;
    if (isSuccess) displayStatus = 'completed';
    else if (isInProgress) displayStatus = 'in-progress';
    else if (isPending) displayStatus = 'pending';
    
    final orbBgColor = AppColors.primary.withValues(alpha: 0.12);
    final orbTextColor = AppColors.primary;
    
    final pillBgColor = isSuccess ? AppColors.primary.withValues(alpha: 0.15) : const Color(0xFFF1F5F9);
    final pillTextColor = isSuccess ? AppColors.primary : const Color(0xFF94A3B8);

    String initials;
    if (name.toLowerCase().contains('ola')) initials = 'O';
    else if (name.toLowerCase().contains('nse')) initials = 'NL';
    else if (name.toLowerCase().contains('reliance')) initials = 'R';
    else initials = name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();
    if (initials.isEmpty) initials = 'C';

    return SizedBox(
      width: 100.w,
      child: Column(
        children: [
          Container(
            width: 72.w,
            height: 72.w,
            decoration: BoxDecoration(
              color: orbBgColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initials,
                style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w800, color: orbTextColor),
              ),
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            name,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w700, color: const Color(0xFF1E293B)),
          ),
          SizedBox(height: 8.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
            decoration: BoxDecoration(
              color: pillBgColor,
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Text(
              displayStatus,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.bold, color: pillTextColor),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionsRow extends StatelessWidget {
  final Function(int)? onNavigate;
  
  const _QuickActionsRow({this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final actions = [
      {'icon': Icons.upload_file_rounded, 'label': 'Upload Docs', 'highlight': false, 'route': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UploadDocumentScreen()))},
      {'icon': Icons.list_alt_rounded, 'label': 'View Claims', 'highlight': false, 'route': () {
        if (onNavigate != null) {
          onNavigate!(1); // Navigate to Claims tab
        }
      }},
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
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor),
            ),
            GestureDetector(
              onTap: () => _showAllActivitiesSheet(context),
              child: Text(
                'Show All',
                style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.primary),
              ),
            ),
          ],
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
            future: ApiService.getClientActivities(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(child: Padding(padding: EdgeInsets.all(16.r), child: CircularProgressIndicator(color: AppColors.primary)));
              }

              final data = snapshot.data;
              var activities = data != null ? data['data'] as List<dynamic>? : null;

              if (activities == null || activities.isEmpty) {
                return Center(
                  child: Padding(
                    padding: EdgeInsets.all(20.r),
                    child: Text(
                      'No recent activity',
                      style: GoogleFonts.inter(fontSize: 14.sp, color: context.textSecondaryColor),
                    ),
                  ),
                );
              }

              return Column(
                children: activities.take(3).map((act) {
                  final title = 'Activity';
                  final message = act['action']?.toString() ?? 'Action performed';
                  final createdAt = act['createdAt']?.toString() ?? '';
                  final time = createdAt.length > 16 ? createdAt.substring(0, 10) : createdAt;
                  return ListTile(
                    leading: Icon(Icons.info_rounded, color: AppColors.accent),
                    title: Text(title, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: context.textColor)),
                    subtitle: Text(message, style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
                    trailing: Text(time, style: GoogleFonts.inter(fontSize: 10.sp, color: context.textSecondaryColor)),
                  );
                }).toList(),
              );
            },
          ),
        ),
      ],
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1);
  }

  void _showAllActivitiesSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        builder: (_, scrollController) => Container(
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
          ),
          child: Column(
            children: [
              SizedBox(height: 16.h),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r))),
              SizedBox(height: 16.h),
              Text('All Activity', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
              SizedBox(height: 16.h),
              Expanded(
                child: FutureBuilder<Map<String, dynamic>?>(
                  future: ApiService.getClientActivities(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
                    }
                    var activities = snapshot.data?['data'] as List<dynamic>?;
                    if (activities == null || activities.isEmpty) {
                      return Center(child: Text('No activity found', style: GoogleFonts.inter(fontSize: 14.sp, color: context.textSecondaryColor)));
                    }
                    return ListView.separated(
                      controller: scrollController,
                      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                      itemCount: activities.length,
                      separatorBuilder: (_, __) => Divider(color: context.borderColor, height: 16.h),
                      itemBuilder: (context, index) {
                        final act = activities[index];
                        final title = 'Activity';
                        final message = act['action']?.toString() ?? 'Action performed';
                        final createdAt = act['createdAt']?.toString() ?? '';
                        final time = createdAt.length > 16 ? createdAt.substring(0, 10) : createdAt;
                        return ListTile(
                          leading: Icon(Icons.info_rounded, color: AppColors.accent),
                          title: Text(title, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: context.textColor)),
                          subtitle: Text(message, style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
                          trailing: Text(time, style: GoogleFonts.inter(fontSize: 10.sp, color: context.textSecondaryColor)),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
              _buildResourceCard(context, 'Understanding IEPF', 'What you need to know before filing.', Icons.menu_book_rounded, 'The Investor Education and Protection Fund (IEPF) is a government initiative to protect investors\' interests. If your shares, dividends, or deposits remain unclaimed for seven consecutive years, the company transfers them to the IEPF authority.\n\nBefore filing a claim, ensure you have:\n- Proof of entitlement (Original share certificates or dividend warrants)\n- Updated KYC documents (Aadhaar, PAN)\n- Active demat account and bank account\n- Client Master List (CML) from your depository participant\n\nThe process involves filing IEPF-5 online and submitting physical documents to the company\'s nodal officer. Our platform tracks this complex process for you.'),
              SizedBox(width: 12.w),
              _buildResourceCard(context, 'Tax Implications', 'How recovered shares affect your taxes.', Icons.account_balance_rounded, 'Recovering shares and accumulated dividends from IEPF can have significant tax implications.\n\n1. Dividends:\nDividends recovered are taxable in the year of receipt under "Income from Other Sources". You may need to pay tax at your applicable slab rate.\n\n2. Shares/Capital Gains:\nWhen you recover shares, there is no immediate tax liability. However, when you eventually sell these recovered shares, capital gains tax will apply. The acquisition date for calculating long-term or short-term capital gains remains the original date you acquired the shares, not the date of recovery from IEPF.\n\nWe recommend consulting with your chartered accountant to properly declare these assets and avoid penalties.'),
              SizedBox(width: 12.w),
              _buildResourceCard(context, 'Legal Heir guide', 'Documentation for inherited shares.', Icons.family_restroom_rounded, 'Claiming shares on behalf of a deceased family member (Transmission of Shares) requires specific legal documentation.\n\nKey documents usually required:\n- Notarized copy of the Death Certificate\n- Succession Certificate, Probate of Will, or Letter of Administration\n- Affidavit from all legal heirs\n- No Objection Certificates (NOC) from other legal heirs if shares are to be transmitted to one person\n- Indemnity bond signed by the claimant\n\nIf the value of shares is below a certain threshold (usually ₹5 Lakhs), the process might be simplified by providing a registered indemnity bond and affidavit without needing a Succession Certificate. Ensure the transmission is completed with the company before filing the IEPF claim.'),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 700.ms).slideX(begin: 0.1);
  }

  Widget _buildResourceCard(BuildContext context, String title, String desc, IconData icon, String content) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ResourceDetailScreen(
              title: title,
              description: desc,
              content: content,
              icon: icon,
            ),
          ),
        );
      },
      child: Container(
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
