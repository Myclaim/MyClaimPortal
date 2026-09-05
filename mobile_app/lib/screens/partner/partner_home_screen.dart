import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/partner_dashboard_provider.dart';
import '../../utils/constants.dart';

class PartnerHomeScreen extends StatefulWidget {
  const PartnerHomeScreen({super.key});

  @override
  State<PartnerHomeScreen> createState() => _PartnerHomeScreenState();
}

class _PartnerHomeScreenState extends State<PartnerHomeScreen> {
  Future<void> _onRefresh() async {
    final auth = context.read<AuthProvider>();
    final id = auth.user?['_id']?.toString() ?? '';
    await context.read<PartnerDashboardProvider>().fetchAll(id);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final p = context.watch<PartnerDashboardProvider>();
    final firstName = auth.userName.split(' ').first;

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: context.surfaceColor,
          onRefresh: _onRefresh,
          child: p.isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary))
              : SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding:
                      EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. App Bar
                      _buildAppBar(context, auth),
                      SizedBox(height: 24.h),

                      // 2. Welcome + Hero Card
                      _buildWelcomeSection(context, firstName, p),
                      SizedBox(height: 20.h),

                      // 3. Stats Row (matches client dashboard exactly)
                      _buildStatsRow(context, p),
                      SizedBox(height: 28.h),

                      // 4. Quick Actions
                      _buildQuickActions(context),
                      SizedBox(height: 28.h),

                      // 5. Recent Leads
                      _buildRecentLeads(context, p),
                      SizedBox(height: 28.h),

                      // 6. Recent Activity
                      _buildRecentActivity(context, p),
                      SizedBox(height: 120.h),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ─── 1. App Bar ──────────────────────────────────────────────
  Widget _buildAppBar(BuildContext context, AuthProvider auth) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(Icons.shield_outlined,
                color: AppColors.primary, size: 28.sp),
            SizedBox(width: 8.w),
            Text('MyClaim',
                style: GoogleFonts.inter(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.bold,
                    color: context.textColor)),
          ],
        ),
        Row(
          children: [
            // Partner badge — matches client notification button position
            Container(
              padding:
                  EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified_rounded,
                      color: AppColors.primary, size: 12.sp),
                  SizedBox(width: 4.w),
                  Text('Partner',
                      style: GoogleFonts.inter(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary)),
                ],
              ),
            ),
            SizedBox(width: 8.w),
            // Avatar — same as client
            Container(
              width: 36.w,
              height: 36.w,
              decoration: const BoxDecoration(
                  color: AppColors.primary, shape: BoxShape.circle),
              child: Center(
                child: Text(
                  auth.userName.isNotEmpty
                      ? auth.userName[0].toUpperCase()
                      : 'P',
                  style: GoogleFonts.inter(
                      fontWeight: FontWeight.w800,
                      fontSize: 14.sp,
                      color: AppColors.background),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─── 2. Welcome + Hero Card ───────────────────────────────────
  Widget _buildWelcomeSection(BuildContext context, String firstName,
      PartnerDashboardProvider p) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back,\n$firstName',
          style: GoogleFonts.inter(
              fontSize: 28.sp,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
              height: 1.2),
        ),
        SizedBox(height: 8.h),
        Text(
          'Manage your leads, clients & service tickets.',
          style: GoogleFonts.inter(
              fontSize: 14.sp,
              color: AppColors.textSecondary,
              height: 1.4),
        ),
        SizedBox(height: 20.h),

        // Hero gradient card — mirrors client's teal card
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(20.r),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF2B837E), Color(0xFF1F6D68)], 
              begin: Alignment.topLeft, 
              end: Alignment.bottomRight
            ),
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
                'PARTNER PERFORMANCE',
                style: GoogleFonts.inter(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.white70,
                    letterSpacing: 0.5),
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
                        p.convertedLeads.toString(),
                        style: GoogleFonts.inter(
                            fontSize: 42.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1),
                      ),
                      SizedBox(width: 8.w),
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 10.w, vertical: 4.h),
                        margin: EdgeInsets.only(bottom: 6.h),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          '${p.totalLeads} Leads',
                          style: GoogleFonts.inter(
                              fontSize: 10.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: EdgeInsets.all(10.r),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.15),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25),
                          width: 1),
                    ),
                    child: Icon(Icons.people_alt_outlined,
                        color: Colors.white, size: 24.sp),
                  ),
                ],
              ),
              SizedBox(height: 8.h),
              Text(
                'Converted leads out of ${p.totalLeads} total generated.',
                style: GoogleFonts.inter(
                    fontSize: 11.sp,
                    color: Colors.white.withValues(alpha: 0.8)),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05),
      ],
    );
  }

  // ─── 3. Stats Row — exact same style as client ────────────────
  Widget _buildStatsRow(BuildContext context, PartnerDashboardProvider p) {
    return Row(
      children: [
        _statItem(context, 'Total Leads', p.totalLeads.toString()),
        SizedBox(width: 10.w),
        _statItem(context, 'Converted',
            p.convertedLeads.toString().padLeft(2, '0')),
        SizedBox(width: 10.w),
        _statItem(
            context, 'Clients', p.activeClients.toString().padLeft(2, '0')),
        SizedBox(width: 10.w),
        _statItem(
            context, 'Tickets', p.openTickets.toString().padLeft(2, '0'),
            isHighlight: true),
      ],
    ).animate().fadeIn(duration: 400.ms, delay: 100.ms).slideY(begin: 0.05);
  }

  Widget _statItem(BuildContext context, String label, String value,
      {bool isHighlight = false}) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 8.w),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: context.borderColor, width: 1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                  fontSize: 10.sp,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500),
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
                  color: isHighlight ? AppColors.primary : context.textColor),
            ),
          ],
        ),
      ),
    );
  }

  // ─── 4. Quick Actions ─────────────────────────────────────────
  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _QA('Add Lead', Icons.person_add_alt_1_rounded, const Color(0xFF8B5CF6)),
      _QA('My Clients', Icons.groups_rounded, AppColors.success),
      _QA('My Tickets', Icons.receipt_long_rounded, AppColors.warning),
      _QA('My Leads', Icons.leaderboard_rounded, const Color(0xFF0EA5E9)),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions',
            style: GoogleFonts.inter(
                fontSize: 16.sp,
                fontWeight: FontWeight.bold,
                color: context.textColor)),
        SizedBox(height: 12.h),
        Row(
          children: List.generate(actions.length, (i) {
            final a = actions[i];
            return Expanded(
              child: GestureDetector(
                onTap: () {},
                child: Container(
                  margin: EdgeInsets.only(
                      right: i < actions.length - 1 ? 10.w : 0),
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                  decoration: BoxDecoration(
                    color: context.surfaceColor,
                    borderRadius: BorderRadius.circular(14.r),
                    border: Border.all(color: context.borderColor),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 38.w,
                        height: 38.w,
                        decoration: BoxDecoration(
                          color: a.color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Icon(a.icon, color: a.color, size: 20.sp),
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        a.label,
                        style: GoogleFonts.inter(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w700,
                            color: context.textColor),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              )
                  .animate(delay: (50 * i).ms)
                  .fadeIn(duration: 300.ms)
                  .slideY(begin: 0.05),
            );
          }),
        ),
      ],
    );
  }

  // ─── 5. Recent Leads ─────────────────────────────────────────
  Widget _buildRecentLeads(BuildContext context, PartnerDashboardProvider p) {
    final leads = p.leads.take(4).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Leads',
                style: GoogleFonts.inter(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.bold,
                    color: context.textColor)),
            Text('${p.totalLeads} total',
                style: GoogleFonts.inter(
                    fontSize: 12.sp, color: AppColors.textSecondary)),
          ],
        ),
        SizedBox(height: 12.h),
        if (leads.isEmpty)
          _emptyCard(context, Icons.people_outline_rounded, 'No leads yet',
              'Add your first lead to get started')
        else
          Container(
            decoration: BoxDecoration(
              color: context.surfaceColor,
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: context.borderColor),
            ),
            child: Column(
              children: List.generate(leads.length, (i) {
                final l = leads[i];
                final name = l['name']?.toString() ?? 'Unknown';
                final service =
                    l['serviceInterest']?.toString() ?? 'N/A';
                final raw = l['status']?.toString().toLowerCase() ?? '';
                final status = raw == 'converted'
                    ? 'Converted'
                    : raw == 'in_discussion'
                        ? 'In Discussion'
                        : raw == 'not_interested'
                            ? 'Not Interested'
                            : 'New';
                return Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(
                          horizontal: 14.w, vertical: 12.h),
                      child: Row(
                        children: [
                          _avatar(name, i),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(name,
                                    style: GoogleFonts.inter(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.w700,
                                        color: context.textColor)),
                                SizedBox(height: 2.h),
                                Text(service,
                                    style: GoogleFonts.inter(
                                        fontSize: 11.sp,
                                        color: AppColors.textSecondary),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          _statusBadge(status),
                        ],
                      ),
                    ),
                    if (i < leads.length - 1)
                      Divider(height: 1, color: context.borderColor),
                  ],
                );
              }),
            ),
          ).animate().fadeIn(duration: 400.ms, delay: 100.ms),
      ],
    );
  }

  // ─── 6. Recent Activity ───────────────────────────────────────
  Widget _buildRecentActivity(
      BuildContext context, PartnerDashboardProvider p) {
    final acts = p.activities.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Recent Activity',
            style: GoogleFonts.inter(
                fontSize: 16.sp,
                fontWeight: FontWeight.bold,
                color: context.textColor)),
        SizedBox(height: 12.h),
        if (acts.isEmpty)
          _emptyCard(context, Icons.history_rounded, 'No activity yet',
              'Activity will appear here as you use the portal')
        else
          Container(
            decoration: BoxDecoration(
              color: context.surfaceColor,
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: context.borderColor),
            ),
            child: Column(
              children: List.generate(acts.length, (i) {
                final act = acts[i];
                final title = act['title']?.toString() ??
                    act['description']?.toString() ??
                    'Activity';
                final timeStr =
                    _timeAgo(act['createdAt']?.toString() ?? '');

                return Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(
                          horizontal: 14.w, vertical: 12.h),
                      child: Row(
                        children: [
                          Container(
                            width: 36.w,
                            height: 36.w,
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.bolt_rounded,
                                color: AppColors.success, size: 18.sp),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Text(title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.inter(
                                    fontSize: 13.sp,
                                    color: context.textColor,
                                    height: 1.4)),
                          ),
                          SizedBox(width: 8.w),
                          Text(timeStr,
                              style: GoogleFonts.inter(
                                  fontSize: 10.sp,
                                  color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    if (i < acts.length - 1)
                      Divider(height: 1, color: context.borderColor),
                  ],
                );
              }),
            ),
          ).animate().fadeIn(duration: 400.ms, delay: 150.ms),
      ],
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────
  Widget _emptyCard(BuildContext context, IconData icon, String title, String sub) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 28.h),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.textSecondary, size: 32.sp),
          SizedBox(height: 10.h),
          Text(title,
              style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w700,
                  color: context.textColor)),
          SizedBox(height: 4.h),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 24.w),
            child: Text(sub,
                style: GoogleFonts.inter(
                    fontSize: 12.sp, color: AppColors.textSecondary),
                textAlign: TextAlign.center),
          ),
        ],
      ),
    );
  }

  Widget _avatar(String name, int index) {
    const colors = [
      Color(0xFF6366F1), Color(0xFF10B981), Color(0xFF0EA5E9),
      Color(0xFFF59E0B), Color(0xFF8B5CF6), Color(0xFFEF4444),
    ];
    final initials = name.trim().isEmpty ? '?' : name.trim().split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join().toUpperCase();
    final color = colors[index % colors.length];
    return Container(
      width: 40.w,
      height: 40.w,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Center(
        child: Text(initials,
            style: GoogleFonts.inter(
                fontSize: 13.sp, fontWeight: FontWeight.w800, color: color)),
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color bg, fg;
    switch (status) {
      case 'Converted':
        bg = AppColors.success.withValues(alpha: 0.12);
        fg = AppColors.success;
        break;
      case 'In Discussion':
        bg = AppColors.warning.withValues(alpha: 0.12);
        fg = AppColors.warning;
        break;
      case 'Not Interested':
        bg = AppColors.error.withValues(alpha: 0.12);
        fg = AppColors.error;
        break;
      default:
        bg = AppColors.purple.withValues(alpha: 0.12);
        fg = AppColors.purple;
    }
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20.r)),
      child: Text(status,
          style: GoogleFonts.inter(
              fontSize: 10.sp, fontWeight: FontWeight.w700, color: fg)),
    );
  }

  String _timeAgo(String iso) {
    if (iso.isEmpty) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${dt.day}/${dt.month}';
    } catch (_) {
      return '';
    }
  }
}

// ─── Quick Action model ───────────────────────────────────────
class _QA {
  final String label;
  final IconData icon;
  final Color color;
  const _QA(this.label, this.icon, this.color);
}
