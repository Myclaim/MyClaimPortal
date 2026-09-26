import 'dart:async';
import 'package:flutter/services.dart';
import '../../services/api_service.dart';
import '../../services/notification_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../utils/constants.dart';
import 'quick_actions/new_claim_screen.dart';
import 'quick_actions/support_screen.dart';
import 'quick_actions/referral_screen.dart';
import 'quick_actions/upload_document_screen.dart';
import 'quick_actions/category_detail_screen.dart';
import 'profile_screen.dart';
import 'resource_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const HomeScreen({super.key, this.onNavigate});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _unreadCount = 0;
  List<dynamic> _notifications = [];
  Timer? _notifTimer;
  Set<String> _seenNotifIds = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().fetchDashboard();
      NotificationService().requestPermissions();
      _loadNotifications(isInitial: true);
    });
    _notifTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (mounted) _loadNotifications(isInitial: false);
    });
  }


  Future<void> _loadNotifications({bool isInitial = false}) async {
    try {
      final res = await ApiService.getNotifications();
      if (res != null && mounted) {
        final notifs = (res['data'] ?? res['notifications']) as List<dynamic>? ?? [];
        final unread = res['unreadCount'] as int? ?? notifs.where((n) => n['isRead'] == false).length;

        if (notifs.isNotEmpty) {
          final unreadItems = notifs.where((n) => n['isRead'] == false).toList();
          final newItems = unreadItems.where((n) => !_seenNotifIds.contains(n['_id'])).toList();
          if (newItems.isNotEmpty) {
            final latest = newItems.first;
            final title = latest['title']?.toString() ?? 'Action Alert';
            final message = latest['message']?.toString() ?? 'Update received from your advisor.';

            // 1. Native device phone push notification
            NotificationService().showNotification(
              id: (latest['_id'] ?? 'alert').hashCode,
              title: title,
              body: message,
              payload: latest['_id']?.toString(),
            );

            // 2. In-app floating alert banner
            _showPushNotificationBanner(title, message);
          }
        }

        _seenNotifIds = notifs.map((n) => n['_id']?.toString() ?? '').toSet();

        setState(() {
          _notifications = notifs;
          _unreadCount = unread;
        });
      }
    } catch (e) {
      debugPrint('[loadNotifications] Error: $e');
    }
  }

  OverlayEntry? _bannerOverlay;

  @override
  void dispose() {
    _bannerOverlay?.remove();
    _bannerOverlay = null;
    _notifTimer?.cancel();
    super.dispose();
  }

  void _showPushNotificationBanner(String title, String message) {
    HapticFeedback.heavyImpact();
    if (!mounted) return;

    _bannerOverlay?.remove();
    _bannerOverlay = null;

    final overlayState = Overlay.of(context, rootOverlay: true);
    final topPadding = MediaQuery.of(context).padding.top;

    _bannerOverlay = OverlayEntry(
      builder: (ctx) => _TopPushBannerWidget(
        title: title,
        message: message,
        topPadding: topPadding,
        onTap: () {
          _bannerOverlay?.remove();
          _bannerOverlay = null;
          _showNotificationsSheet(context);
        },
        onDismiss: () {
          _bannerOverlay?.remove();
          _bannerOverlay = null;
        },
      ),
    );

    overlayState.insert(_bannerOverlay!);
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
                      // 1. Hero Header (AppBar + Welcome combined)
                      _buildHeroHeader(context, firstName, dash),
                      SizedBox(height: 20.h),

                      // 3. Category Section
                      const _CategorySection(),
                      SizedBox(height: 28.h),

                      // 6. Claims & Services
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

  Widget _buildHeroHeader(BuildContext context, String firstName, DashboardProvider dash) {


    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Top bar row ──────────────────────────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 36.w, height: 36.w,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Icon(Icons.shield_rounded, color: AppColors.primary, size: 20.sp),
                ),
                SizedBox(width: 8.w),
                Text(
                  'MyClaim',
                  style: GoogleFonts.inter(fontSize: 20.sp, fontWeight: FontWeight.w800, color: context.textColor),
                ),
              ],
            ),
            Row(
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 40.w, height: 40.w,
                      decoration: BoxDecoration(
                        color: context.surfaceColor,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: Icon(Icons.notifications_none_rounded, color: context.textColor, size: 20.sp),
                        onPressed: () => _showNotificationsSheet(context),
                      ),
                    ),
                    if (_unreadCount > 0)
                      Positioned(
                        top: -3, right: -3,
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
                          constraints: BoxConstraints(minWidth: 16.w, minHeight: 16.w),
                          decoration: BoxDecoration(
                            color: AppColors.error,
                            borderRadius: BorderRadius.circular(10.r),
                            border: Border.all(color: context.backgroundColor, width: 1.5),
                          ),
                          child: Center(
                            child: Text(
                              _unreadCount > 9 ? '9+' : '$_unreadCount',
                              style: TextStyle(color: Colors.white, fontSize: 9.sp, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                SizedBox(width: 8.w),
                GestureDetector(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())),
                  child: Container(
                    width: 40.w, height: 40.w,
                    decoration: BoxDecoration(
                      gradient: AppColors.greenGradient,
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Center(
                      child: Text(
                        firstName.isNotEmpty ? firstName[0].toUpperCase() : 'U',
                        style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        SizedBox(height: 16.h),

        // ── Promo Banner Carousel (top) ──────────────────────────────
        const _PromoBannerCarousel(),
        SizedBox(height: 22.h),

      ],
    ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.04);
  }

  String _formatNotifTime(dynamic createdAt) {
    if (createdAt == null) return '';
    try {
      final dt = DateTime.parse(createdAt.toString());
      final diff = DateTime.now().difference(dt);
      if (diff.inSeconds < 60) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }

  Future<void> _markAllRead() async {
    final success = await ApiService.markAllNotificationsRead();
    if (success && mounted) {
      setState(() {
        _unreadCount = 0;
        for (var n in _notifications) {
          n['isRead'] = true;
        }
      });
    }
  }

  void _showNotificationsSheet(BuildContext context) {
    // Refresh notifications when sheet is opened
    _loadNotifications(isInitial: true);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setSheetState) => DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.92,
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
                    Row(
                      children: [
                        Text('Notifications', style: GoogleFonts.inter(fontSize: 20.sp, fontWeight: FontWeight.w800, color: context.textColor)),
                        if (_unreadCount > 0) ...[
                          SizedBox(width: 8.w),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10.r),
                            ),
                            child: Text('$_unreadCount new', style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w700, color: AppColors.primary)),
                          ),
                        ],
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          tooltip: 'Test Push Alert',
                          icon: Icon(Icons.send_to_mobile_rounded, color: AppColors.primary, size: 20.sp),
                          onPressed: () {
                            NotificationService().showNotification(
                              id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
                              title: '🔔 Advisor Update: Claim Approved',
                              body: 'Superadmin has approved your IEPF Claim documents.',
                            );
                            _showPushNotificationBanner(
                              '🔔 Advisor Update: Claim Approved',
                              'Superadmin has approved your IEPF Claim documents.',
                            );
                          },
                        ),
                        if (_unreadCount > 0)
                          TextButton(
                            onPressed: () async {
                              await _markAllRead();
                              setSheetState(() {});
                            },
                            child: Text('Mark all read', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13.sp)),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              Divider(color: context.borderColor, height: 1),
              Expanded(
                child: _notifications.isEmpty
                    ? Center(
                        child: Padding(
                          padding: EdgeInsets.all(24.r),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 56.w, height: 56.w,
                                decoration: BoxDecoration(
                                  color: context.surfaceColor,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: context.borderColor),
                                ),
                                child: Icon(Icons.notifications_none_rounded, color: context.textSecondaryColor, size: 28.sp),
                              ),
                              SizedBox(height: 12.h),
                              Text('No notifications yet', style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w700, color: context.textColor)),
                              SizedBox(height: 4.h),
                              Text(
                                "Updates from Superadmin, Partner & claims will appear here.",
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor, height: 1.4),
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.separated(
                        controller: scrollController,
                        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                        itemCount: _notifications.length,
                        separatorBuilder: (_, __) => Divider(color: context.borderColor.withValues(alpha: 0.5), height: 16.h),
                        itemBuilder: (context, index) {
                          final notif = _notifications[index];
                          final isRead = notif['isRead'] == true;
                          final type = notif['type']?.toString().toLowerCase() ?? '';
                          final title = notif['title']?.toString() ?? 'Notification';
                          final message = notif['message']?.toString() ?? '';
                          final timeStr = _formatNotifTime(notif['createdAt'] ?? notif['date']);

                          IconData iconData = Icons.notifications_active_rounded;
                          Color iconColor = AppColors.primary;

                          if (type.contains('claim')) {
                            iconData = Icons.assignment_turned_in_rounded;
                            iconColor = const Color(0xFF10B981);
                          } else if (type.contains('ticket')) {
                            iconData = Icons.confirmation_number_rounded;
                            iconColor = const Color(0xFF8B5CF6);
                          } else if (type.contains('doc')) {
                            iconData = Icons.description_rounded;
                            iconColor = const Color(0xFF3B82F6);
                          } else if (type.contains('partner')) {
                            iconData = Icons.handshake_rounded;
                            iconColor = const Color(0xFFF59E0B);
                          }

                          return InkWell(
                            borderRadius: BorderRadius.circular(12.r),
                            onTap: () async {
                              if (!isRead && notif['_id'] != null) {
                                await ApiService.markNotificationRead(notif['_id'].toString());
                                setState(() {
                                  notif['isRead'] = true;
                                  if (_unreadCount > 0) _unreadCount--;
                                });
                                setSheetState(() {});
                              }
                            },
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: 4.h, horizontal: 4.w),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 38.w, height: 38.w,
                                    decoration: BoxDecoration(
                                      color: iconColor.withValues(alpha: 0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(iconData, color: iconColor, size: 18.sp),
                                  ),
                                  SizedBox(width: 12.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                title,
                                                style: GoogleFonts.inter(
                                                  fontSize: 13.sp,
                                                  fontWeight: isRead ? FontWeight.w600 : FontWeight.w800,
                                                  color: context.textColor,
                                                ),
                                              ),
                                            ),
                                            if (timeStr.isNotEmpty) ...[
                                              SizedBox(width: 6.w),
                                              Text(
                                                timeStr,
                                                style: GoogleFonts.inter(fontSize: 10.sp, color: context.textSecondaryColor),
                                              ),
                                            ],
                                          ],
                                        ),
                                        SizedBox(height: 3.h),
                                        Text(
                                          message,
                                          style: GoogleFonts.inter(
                                            fontSize: 12.sp,
                                            color: context.textSecondaryColor,
                                            height: 1.35,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (!isRead) ...[
                                    SizedBox(width: 8.w),
                                    Container(
                                      width: 8.w, height: 8.w,
                                      margin: EdgeInsets.only(top: 6.h),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
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

}


// ─── Promo Banner Carousel ─────────────────────────────────────────────────

class _PromoBannerCarousel extends StatefulWidget {
  const _PromoBannerCarousel();

  @override
  State<_PromoBannerCarousel> createState() => _PromoBannerCarouselState();
}

class _PromoBannerCarouselState extends State<_PromoBannerCarousel> {
  final PageController _controller = PageController();
  int _currentPage = 0;
  Timer? _timer;

  static const _banners = [
    {
      'title': 'Recover Your\nLost Shares',
      'subtitle': 'Fast, Hassle-Free IEPF Claims',
      'tag': 'Get Started Today',
      'gradient': [Color(0xFF00E676), Color(0xFF22C55E)],
      'icon': Icons.account_balance_rounded,
    },
    {
      'title': 'Share Transfer\n& Transmission',
      'subtitle': 'Claim Inherited Assets Easily',
      'tag': 'Expert Guidance',
      'gradient': [Color(0xFF10B981), Color(0xFF059669)],
      'icon': Icons.swap_horiz_rounded,
    },
    {
      'title': 'KYC &\nName Update',
      'subtitle': 'Hassle-Free Document Services',
      'tag': 'Quick Assistance',
      'gradient': [Color(0xFFEC4899), Color(0xFFBE185D)],
      'icon': Icons.manage_accounts_rounded,
    },
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted) return;
      final next = (_currentPage + 1) % _banners.length;
      _controller.animateToPage(next,
          duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 180.h,
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemCount: _banners.length,
            itemBuilder: (context, index) {
              final b = _banners[index];
              final colors = b['gradient'] as List<Color>;
              return Container(
                margin: EdgeInsets.symmetric(horizontal: 2.w),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: colors,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20.r),
                  boxShadow: [
                    BoxShadow(
                      color: colors.first.withValues(alpha: 0.35),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    // Decorative circle
                    Positioned(
                      right: -20,
                      bottom: -20,
                      child: Container(
                        width: 120.w,
                        height: 120.w,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.08),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 16,
                      top: 16,
                      child: Container(
                        width: 80.w,
                        height: 80.w,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.12),
                        ),
                        child: Icon(b['icon'] as IconData, color: Colors.white.withValues(alpha: 0.9), size: 36.sp),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.all(20.r),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            b['title'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.2,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            b['subtitle'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 12.sp,
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                          ),
                          SizedBox(height: 10.h),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 5.h),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.22),
                              borderRadius: BorderRadius.circular(20.r),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                            ),
                            child: Text(
                              b['tag'] as String,
                              style: GoogleFonts.inter(
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        SizedBox(height: 10.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_banners.length, (i) {
            final isActive = i == _currentPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: EdgeInsets.symmetric(horizontal: 3.w),
              width: isActive ? 20.w : 6.w,
              height: 6.h,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.primary.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(3.r),
              ),
            );
          }),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05);
  }
}

// ─── Category Section ───────────────────────────────────────────────────────

class _CategorySection extends StatefulWidget {
  const _CategorySection();

  @override
  State<_CategorySection> createState() => _CategorySectionState();
}

class _CategorySectionState extends State<_CategorySection> {
  List<Map<String, dynamic>> _categories = [
    {
      'key': 'iepf-claims',
      'name': 'IEPF\nClaims',
      'tag': 'Unclaimed Wealth',
      'icon': Icons.account_balance_rounded,
      'bg': const Color(0xFFEDFDF5),
      'bgDark': const Color(0xFF0D2118),
      'iconColor': AppColors.primary,
      'serviceMapping': 'IEPF Claim (Unclaimed Shares & Dividends)',
      'actionLabel': 'Free IEPF Search',
      'stats': '₹1.18L Cr+ Unclaimed',
      'estimatedTime': '60 - 90 Days',
    },
    {
      'key': 'share-transfer',
      'name': 'Share\nTransfer',
      'tag': 'Transmission & Gifting',
      'icon': Icons.swap_horiz_rounded,
      'bg': const Color(0xFFECFDF5),
      'bgDark': const Color(0xFF0D2016),
      'iconColor': AppColors.success,
      'serviceMapping': 'Physical Shares Transmission / Transfer',
      'actionLabel': 'Apply for Share Transfer',
      'stats': '100% Legal Backing',
      'estimatedTime': '30 - 45 Days',
    },
    {
      'key': 'duplicate-certificate',
      'name': 'Duplicate\nCertificate',
      'tag': 'Lost / Damaged Shares',
      'icon': Icons.file_copy_rounded,
      'bg': const Color(0xFFFFF7ED),
      'bgDark': const Color(0xFF1F1508),
      'iconColor': AppColors.warning,
      'serviceMapping': 'Loss of Share Certificates (Duplicate)',
      'actionLabel': 'Request Duplicate Certificate',
      'stats': 'End-to-End RTA Liaison',
      'estimatedTime': '45 - 60 Days',
    },
    {
      'key': 'kyc-name-update',
      'name': 'KYC &\nName Update',
      'tag': 'SEBI Compliance',
      'icon': Icons.manage_accounts_rounded,
      'bg': const Color(0xFFFDF2F8),
      'bgDark': const Color(0xFF1F0A14),
      'iconColor': AppColors.secondary,
      'serviceMapping': 'Name / Signature / Address Mismatch',
      'actionLabel': 'Start KYC Update',
      'stats': 'Unfreeze Blocked Folios',
      'estimatedTime': '15 - 30 Days',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadFromBackend();
  }

  Future<void> _loadFromBackend() async {
    final list = await ApiService.getServiceCategories();
    if (list.isNotEmpty && mounted) {
      setState(() {
        final updated = <Map<String, dynamic>>[];
        for (var defaultCat in _categories) {
          final match = list.firstWhere(
            (c) => c['key'] == defaultCat['key'],
            orElse: () => <String, dynamic>{},
          );
          if (match.isNotEmpty) {
            updated.add({
              ...defaultCat,
              ...match,
              'icon': defaultCat['icon'],
              'bg': defaultCat['bg'],
              'bgDark': defaultCat['bgDark'],
              'iconColor': defaultCat['iconColor'],
              'name': defaultCat['name'],
            });
          } else {
            updated.add(defaultCat);
          }
        }
        _categories = updated;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Category',
          style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.bold, color: context.textColor),
        ),
        SizedBox(height: 14.h),
        Row(
          children: [
            Expanded(child: _buildCard(context, _categories[0], isDark)),
            SizedBox(width: 12.w),
            Expanded(child: _buildCard(context, _categories[1], isDark)),
          ],
        ),
        SizedBox(height: 12.h),
        Row(
          children: [
            Expanded(child: _buildCard(context, _categories[2], isDark)),
            SizedBox(width: 12.w),
            Expanded(child: _buildCard(context, _categories[3], isDark)),
          ],
        ),
      ],
    ).animate().fadeIn(duration: 400.ms, delay: 120.ms).slideY(begin: 0.08);
  }

  Widget _buildCard(BuildContext context, Map<String, dynamic> cat, bool isDark) {
    final bg = isDark ? cat['bgDark'] as Color : cat['bg'] as Color;
    final iconColor = cat['iconColor'] as Color;
    final icon = cat['icon'] as IconData;
    final name = cat['name'] as String;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CategoryDetailScreen(category: cat),
          ),
        );
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18.r),
        child: Container(
          height: 130.h,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(18.r),
            border: Border.all(color: iconColor.withValues(alpha: isDark ? 0.18 : 0.1)),
          ),
          child: Stack(
            children: [
              // Ghost large icon – bottom-right (illustration effect)
              Positioned(
                right: -8,
                bottom: -8,
                child: Icon(icon, size: 88.sp, color: iconColor.withValues(alpha: 0.15)),
              ),
              // Smaller coloured badge icon bottom-right
              Positioned(
                right: 12,
                bottom: 12,
                child: Container(
                  width: 40.w,
                  height: 40.w,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: isDark ? 0.2 : 0.15),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(icon, color: iconColor, size: 20.sp),
                ),
              ),
              // Name top-left, "More →" bottom-left
              Padding(
                padding: EdgeInsets.all(14.r),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      name,
                      style: GoogleFonts.inter(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w700,
                        color: context.textColor,
                        height: 1.3,
                      ),
                    ),
                    Text(
                      'More →',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: iconColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Claims & Services ──────────────────────────────────────────────────────

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
                    'Invite friends to recover their lost shares and earn rewards.',
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
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1);
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

class _TopPushBannerWidget extends StatefulWidget {
  final String title;
  final String message;
  final double topPadding;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const _TopPushBannerWidget({
    required this.title,
    required this.message,
    required this.topPadding,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  State<_TopPushBannerWidget> createState() => _TopPushBannerWidgetState();
}

class _TopPushBannerWidgetState extends State<_TopPushBannerWidget> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<Offset> _offsetAnim;
  late Animation<double> _fadeAnim;
  Timer? _dismissTimer;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _offsetAnim = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutBack));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeIn);

    _animController.forward();

    _dismissTimer = Timer(const Duration(seconds: 5), () {
      if (mounted) {
        _animController.reverse().then((_) {
          widget.onDismiss();
        });
      }
    });
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  void _dismissNow() {
    _dismissTimer?.cancel();
    _animController.reverse().then((_) {
      widget.onDismiss();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: widget.topPadding + 10.h,
      left: 16.w,
      right: 16.w,
      child: Material(
        color: Colors.transparent,
        child: SlideTransition(
          position: _offsetAnim,
          child: FadeTransition(
            opacity: _fadeAnim,
            child: GestureDetector(
              onTap: () {
                _dismissTimer?.cancel();
                widget.onTap();
              },
              onVerticalDragUpdate: (details) {
                if (details.primaryDelta != null && details.primaryDelta! < -5) {
                  _dismissNow();
                }
              },
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(18.r),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.5), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.45),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: EdgeInsets.all(8.r),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.notifications_active_rounded, color: AppColors.primary, size: 20.sp),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'MY CLAIM · NOW',
                                style: GoogleFonts.inter(
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primary,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              GestureDetector(
                                onTap: _dismissNow,
                                child: Icon(Icons.close_rounded, size: 14.sp, color: Colors.white54),
                              ),
                            ],
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            widget.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            widget.message,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 11.sp,
                              color: const Color(0xFFCBD5E1),
                              height: 1.3,
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
        ),
      ),
    );
  }
}

