import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../utils/constants.dart';
import 'claims_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dash = context.watch<DashboardProvider>();
    final firstName = auth.userName.split(' ').first;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.accent,
        backgroundColor: AppColors.surface,
        onRefresh: () => context.read<DashboardProvider>().fetchDashboard(),
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──────────────────────────────────
            SliverAppBar(
              expandedHeight: 160,
              floating: false,
              pinned: true,
              backgroundColor: AppColors.background,
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                background: _buildHeader(context, firstName, auth),
              ),
              actions: [
                _NotifBell(count: 3),
                SizedBox(width: 12.w),
              ],
            ),

            // ── Body ─────────────────────────────────────
            SliverToBoxAdapter(
              child: dash.isLoading
                  ? _buildSkeleton()
                  : _buildContent(context, dash),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name, AuthProvider auth) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.accent.withValues(alpha: 0.2),
            AppColors.primary.withValues(alpha: 0.1),
            Colors.transparent,
          ],
        ),
      ),
      padding: EdgeInsets.fromLTRB(20, 56, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [AppColors.accent, AppColors.accentDark]),
                  borderRadius: BorderRadius.circular(14.r),
                  boxShadow: [BoxShadow(color: AppColors.accent.withValues(alpha: 0.4), blurRadius: 12, offset: Offset(0, 4))],
                ),
                child: Center(
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'C',
                    style: TextStyle(color: Colors.white, fontSize: 18.sp, fontWeight: FontWeight.w900),
                  ),
                ),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Text('Hey, $name! ', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: AppColors.text, letterSpacing: -0.5)),
                      Text('👋', style: TextStyle(fontSize: 16.sp)),
                    ]),
                    Text('Good to see you back', style: TextStyle(fontSize: 12.sp, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, DashboardProvider dash) {
    final overview = dash.overview;
    final claims = dash.claims;

    return Padding(
      padding: EdgeInsets.all(16.r),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Summary Card ─────────────────────────────
          _SummaryCard(overview: overview)
              .animate().fade(duration: 500.ms).slideY(begin: 0.1),

          SizedBox(height: 20.h),

          // ── Quick Actions ─────────────────────────────
          _SectionHeader(title: 'Quick Actions', showAll: false),
          SizedBox(height: 12.h),
          _QuickActionsRow().animate(delay: 100.ms).fade().slideY(begin: 0.1),

          SizedBox(height: 24.h),

          // ── Pending Actions Alert ─────────────────────
          if (claims.any((c) => c['status']?.toString().toLowerCase().contains('pending') == true))
            _PendingActionsCard(claims: claims).animate(delay: 150.ms).fade().slideY(begin: 0.1),

          SizedBox(height: 20.h),

          // ── My Claims ────────────────────────────────
          _SectionHeader(
            title: 'My Claims',
            showAll: true,
            onTap: () {},
          ),
          SizedBox(height: 12.h),

          ...claims.take(3).toList().asMap().entries.map((e) =>
            Padding(
              padding: EdgeInsets.only(bottom: 10),
              child: _ClaimListTile(
                claim: Map<String, dynamic>.from(e.value),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ClaimDetailScreen(claim: Map<String, dynamic>.from(e.value))),
                ),
              ).animate(delay: Duration(milliseconds: 200 + e.key * 80))
                  .fade().slideX(begin: 0.05),
            ),
          ),

          SizedBox(height: 24.h),

          // ── Refer & Earn ──────────────────────────────
          _ReferEarnBanner().animate(delay: 400.ms).fade().slideY(begin: 0.1),

          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: EdgeInsets.all(16.r),
      child: Column(
        children: List.generate(4, (i) => Padding(
          padding: EdgeInsets.only(bottom: 12),
          child: Container(
            height: 80, decoration: BoxDecoration(
              color: AppColors.surface, borderRadius: BorderRadius.circular(16.r),
            ),
          ).animate(onPlay: (c) => c.repeat(reverse: true))
              .shimmer(color: Colors.white.withValues(alpha: 0.05)),
        )),
      ),
    );
  }
}

// ── Summary Card ─────────────────────────────────────────
class _SummaryCard extends StatelessWidget {
  final Map<String, dynamic> overview;
  const _SummaryCard({required this.overview});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [AppColors.accent.withValues(alpha: 0.15), AppColors.primary.withValues(alpha: 0.08)],
        ),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.accent.withValues(alpha: 0.2), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.account_balance_wallet_rounded, color: AppColors.accent, size: 18.sp),
              SizedBox(width: 8.w),
              Text('Portfolio Overview', style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w700, color: AppColors.accent)),
              Spacer(),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)),
                child: Text('Live', style: TextStyle(fontSize: 10.sp, color: AppColors.accent, fontWeight: FontWeight.w800)),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Row(
            children: [
              _StatItem(label: 'Total Claims', value: '${overview['totalClaims'] ?? 3}', color: AppColors.blue),
              _vDivider(),
              _StatItem(label: 'In Progress', value: '${overview['inProgress'] ?? 2}', color: AppColors.warning),
              _vDivider(),
              _StatItem(label: 'Completed', value: '${overview['completed'] ?? 1}', color: AppColors.accent),
              _vDivider(),
              _StatItem(label: 'Need Action', value: '${overview['needAction'] ?? 2}', color: AppColors.error),
            ],
          ),
          SizedBox(height: 16.h),
          // Recovery value row
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              children: [
                Icon(Icons.trending_up_rounded, color: AppColors.accent, size: 18.sp),
                SizedBox(width: 8.w),
                Text('Total Recovery Value', style: TextStyle(fontSize: 12.sp, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                Spacer(),
                Text('₹3.45L', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: AppColors.accent, letterSpacing: -0.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _vDivider() => Container(width: 1, height: 36, color: Colors.white.withValues(alpha: 0.08), margin: EdgeInsets.symmetric(horizontal: 4.w));
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 22.sp, fontWeight: FontWeight.w900, color: color, letterSpacing: -0.5)),
          SizedBox(height: 2.h),
          Text(label, style: TextStyle(fontSize: 9.sp, color: AppColors.textSecondary, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────
class _QuickActionsRow extends StatelessWidget {
  const _QuickActionsRow();

  @override
  Widget build(BuildContext context) {
    final actions = [
      {'icon': Icons.add_circle_rounded, 'label': 'New\nClaim', 'color': AppColors.accent},
      {'icon': Icons.upload_file_rounded, 'label': 'Upload\nDocs', 'color': AppColors.blue},
      {'icon': Icons.headset_mic_rounded, 'label': 'Support\nTicket', 'color': AppColors.purple},
      {'icon': Icons.search_rounded, 'label': 'IEPF\nSearch', 'color': AppColors.warning},
      {'icon': Icons.people_rounded, 'label': 'Family\nTree', 'color': AppColors.error},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: actions.map((a) {
          final color = a['color'] as Color;
          return GestureDetector(
            onTap: () {},
            child: Container(
              width: 72, margin: EdgeInsets.only(right: 10),
              child: Column(
                children: [
                  Container(
                    width: 54, height: 54,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16.r),
                      border: Border.all(color: color.withValues(alpha: 0.25), width: 1),
                    ),
                    child: Icon(a['icon'] as IconData, color: color, size: 24.sp),
                  ),
                  SizedBox(height: 6.h),
                  Text(a['label'] as String,
                    style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600, color: AppColors.textSecondary, height: 1.2),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ── Pending Actions ───────────────────────────────────────
class _PendingActionsCard extends StatelessWidget {
  final List<dynamic> claims;
  const _PendingActionsCard({required this.claims});

  @override
  Widget build(BuildContext context) {
    final pendingClaims = claims.where((c) => c['status']?.toString().toLowerCase().contains('pending') == true).toList();
    return Container(
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.25), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 16.sp),
            SizedBox(width: 8.w),
            Text('Action Required', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: AppColors.text)),
            Spacer(),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
              decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)),
              child: Text('${pendingClaims.length} pending', style: TextStyle(fontSize: 10.sp, color: AppColors.warning, fontWeight: FontWeight.w800)),
            ),
          ]),
          SizedBox(height: 12.h),
          ...pendingClaims.take(2).map((c) => Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Row(children: [
              Container(width: 36, height: 36, decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10.r)), child: Icon(Icons.upload_rounded, color: AppColors.warning, size: 16.sp)),
              SizedBox(width: 12.w),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${c['name']} — Documents Needed', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: AppColors.text)),
                Text('Upload PAN Card & Bank Cheque', style: TextStyle(fontSize: 11.sp, color: AppColors.textSecondary)),
              ])),
              Container(padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h), decoration: BoxDecoration(color: AppColors.warning, borderRadius: BorderRadius.circular(8.r)), child: Text('Upload', style: TextStyle(color: Colors.white, fontSize: 11.sp, fontWeight: FontWeight.w800))),
            ]),
          )),
        ],
      ),
    );
  }
}

// ── Claim List Tile ───────────────────────────────────────
class _ClaimListTile extends StatelessWidget {
  final Map<String, dynamic> claim;
  final VoidCallback onTap;
  const _ClaimListTile({required this.claim, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final status = claim['status'] as String? ?? '';
    final progress = claim['progress'] as int? ?? 0;
    final isActive = status.toLowerCase() == 'active';
    final isPending = status.toLowerCase().contains('pending');
    final orbColor = isPending ? AppColors.purple : isActive ? AppColors.accent : AppColors.warning;
    final initials = (claim['name'] as String? ?? '').split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(14.r),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: orbColor.withValues(alpha: 0.15), width: 1),
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [orbColor.withValues(alpha: 0.3), orbColor.withValues(alpha: 0.08)]),
                borderRadius: BorderRadius.circular(13.r),
              ),
              child: Center(child: Text(initials, style: TextStyle(color: orbColor, fontWeight: FontWeight.w900, fontSize: 14.sp))),
            ),
            SizedBox(width: 12.w),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(child: Text(claim['name'] ?? '', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: AppColors.text), overflow: TextOverflow.ellipsis)),
                    StatusBadge(status: status),

                  ]),
                  SizedBox(height: 4.h),
                  Text('${claim['shares']} shares · ${claim['estValue']}', style: TextStyle(fontSize: 11.sp, color: AppColors.textSecondary)),
                  SizedBox(height: 6.h),
                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(99.r),
                    child: LinearProgressIndicator(
                      value: progress / 100,
                      minHeight: 4,
                      backgroundColor: Colors.white.withValues(alpha: 0.06),
                      valueColor: AlwaysStoppedAnimation(orbColor),
                    ),
                  ),
                  SizedBox(height: 3.h),
                  Text('$progress% complete', style: TextStyle(fontSize: 10.sp, color: orbColor, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            SizedBox(width: 8.w),
            Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary.withValues(alpha: 0.5), size: 20.sp),
          ],
        ),
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String status;
  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final lower = status.toLowerCase();
    Color color;
    if (lower == 'active') {
      color = AppColors.accent;
    } else if (lower.contains('progress')) color = AppColors.warning;
    else if (lower.contains('pending')) color = AppColors.purple;
    else color = AppColors.textSecondary;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(99.r), border: Border.all(color: color.withValues(alpha: 0.3), width: 1)),
      child: Text(status, style: TextStyle(fontSize: 9.sp, fontWeight: FontWeight.w800, color: color)),
    );
  }
}

// ── Section Header ────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  final bool showAll;
  final VoidCallback? onTap;
  const _SectionHeader({required this.title, required this.showAll, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: AppColors.text, letterSpacing: -0.3)),
        if (showAll)
          GestureDetector(
            onTap: onTap,
            child: Text('View All', style: TextStyle(fontSize: 12.sp, color: AppColors.accent, fontWeight: FontWeight.w700)),
          ),
      ],
    );
  }
}

// ── Refer & Earn ──────────────────────────────────────────
class _ReferEarnBanner extends StatelessWidget {
  const _ReferEarnBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.accent.withValues(alpha: 0.15), AppColors.primary.withValues(alpha: 0.1)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.accent.withValues(alpha: 0.2), width: 1),
      ),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(gradient: LinearGradient(colors: [AppColors.accent, AppColors.accentDark]), shape: BoxShape.circle),
            child: Icon(Icons.card_giftcard_rounded, color: Colors.white, size: 22.sp),
          ),
          SizedBox(width: 14.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Refer & Earn ₹5,000', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: AppColors.text)),
                SizedBox(height: 2.h),
                Text('For every friend who completes claim recovery', style: TextStyle(fontSize: 11.sp, color: AppColors.textSecondary)),
              ],
            ),
          ),
          SizedBox(width: 8.w),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 9.h),
            decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(10.r)),
            child: Text('Refer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12.sp)),
          ),
        ],
      ),
    );
  }
}

// ── Notification Bell ─────────────────────────────────────
class _NotifBell extends StatelessWidget {
  final int count;
  const _NotifBell({required this.count});

  @override
  Widget build(BuildContext context) {
    return Stack(clipBehavior: Clip.none, children: [
      Container(
        width: 38, height: 38,
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12.r), border: Border.all(color: Colors.white.withValues(alpha: 0.08), width: 1)),
        child: Icon(Icons.notifications_rounded, color: AppColors.text, size: 20.sp),
      ),
      if (count > 0)
        Positioned(
          top: -2, right: -2,
          child: Container(
            width: 16, height: 16,
            decoration: BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
            child: Center(child: Text('$count', style: TextStyle(color: Colors.white, fontSize: 9.sp, fontWeight: FontWeight.w900))),
          ),
        ),
    ]);
  }
}
