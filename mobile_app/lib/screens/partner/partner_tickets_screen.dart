import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/partner_dashboard_provider.dart';
import '../../utils/constants.dart';

class PartnerTicketsScreen extends StatefulWidget {
  const PartnerTicketsScreen({super.key});

  @override
  State<PartnerTicketsScreen> createState() => _PartnerTicketsScreenState();
}

class _PartnerTicketsScreenState extends State<PartnerTicketsScreen> {
  String _filterStatus = 'All';
  String _search = '';

  static const _filters = ['All', 'Active', 'In Process', 'Completed'];

  String _mapStatus(String raw) {
    final s = raw.toLowerCase();
    if (s == 'active' || s == 'allocated') return 'Active';
    if (s.contains('process') || s.contains('progress')) return 'In Process';
    if (s == 'completed' || s == 'resolved' || s == 'closed') return 'Completed';
    return 'Active';
  }

  Future<void> _onRefresh() async {
    final auth = context.read<AuthProvider>();
    final id = auth.user?['_id']?.toString() ?? '';
    await context.read<PartnerDashboardProvider>().fetchAll(id);
  }

  String _formatDate(String? iso) {
    if (iso == null || iso.isEmpty) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return '';
    }
  }

  String _timeAgo(String? iso) {
    if (iso == null || iso.isEmpty) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<PartnerDashboardProvider>();
    final tickets = p.tickets.where((t) {
      final mappedStatus = _mapStatus(t['status']?.toString() ?? '');
      final statusMatch = _filterStatus == 'All' || mappedStatus == _filterStatus;
      final q = _search.toLowerCase();
      final clientName = (t['companyName'] ?? t['clientName'] ?? t['clientId']?['name'] ?? '').toString().toLowerCase();
      final service = (t['service'] ?? t['topicName'] ?? t['hubType'] ?? '').toString().toLowerCase();
      final searchMatch = q.isEmpty || clientName.contains(q) || service.contains(q);
      return statusMatch && searchMatch;
    }).toList();

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: context.surfaceColor,
          onRefresh: _onRefresh,
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Ticket Tracker',
                                  style: GoogleFonts.inter(
                                      fontSize: 22.sp,
                                      fontWeight: FontWeight.w800,
                                      color: context.textColor)),
                              Text('Monitor service progress',
                                  style: GoogleFonts.inter(
                                      fontSize: 12.sp,
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                          Container(
                            padding: EdgeInsets.all(10.r),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12.r),
                            ),
                            child: Icon(Icons.receipt_long_rounded,
                                color: AppColors.warning, size: 22.sp),
                          ),
                        ],
                      ),
                      SizedBox(height: 16.h),

                      // Stats row
                      Row(
                        children: [
                          _TicketStat('Total', p.tickets.length.toString(), AppColors.blue),
                          SizedBox(width: 10.w),
                          _TicketStat('Active', p.activeTickets.toString(), AppColors.primary),
                          SizedBox(width: 10.w),
                          _TicketStat('Open', p.openTickets.toString(), AppColors.warning),
                          SizedBox(width: 10.w),
                          _TicketStat('Done', p.completedTickets.toString(), AppColors.success),
                        ],
                      ),
                      SizedBox(height: 16.h),

                      // Search
                      Container(
                        height: 46.h,
                        decoration: BoxDecoration(
                          color: context.surfaceColor,
                          borderRadius: BorderRadius.circular(12.r),
                          border: Border.all(color: context.borderColor),
                        ),
                        child: Row(
                          children: [
                            SizedBox(width: 14.w),
                            Icon(Icons.search_rounded,
                                color: AppColors.textSecondary, size: 20.sp),
                            SizedBox(width: 8.w),
                            Expanded(
                              child: TextField(
                                onChanged: (v) => setState(() => _search = v),
                                style: GoogleFonts.inter(
                                    fontSize: 14.sp, color: context.textColor),
                                decoration: InputDecoration(
                                  hintText: 'Search tickets…',
                                  hintStyle: GoogleFonts.inter(
                                      fontSize: 14.sp,
                                      color: AppColors.textSecondary),
                                  border: InputBorder.none,
                                  isDense: true,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 12.h),

                      // Filter chips
                      SizedBox(
                        height: 34.h,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _filters.length,
                          separatorBuilder: (_, __) => SizedBox(width: 8.w),
                          itemBuilder: (_, i) {
                            final f = _filters[i];
                            final isActive = _filterStatus == f;
                            return GestureDetector(
                              onTap: () => setState(() => _filterStatus = f),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: EdgeInsets.symmetric(horizontal: 16.w),
                                decoration: BoxDecoration(
                                  color: isActive ? AppColors.primary : context.surfaceColor,
                                  borderRadius: BorderRadius.circular(20.r),
                                  border: Border.all(
                                    color: isActive ? AppColors.primary : context.borderColor,
                                  ),
                                ),
                                child: Center(
                                  child: Text(f,
                                      style: GoogleFonts.inter(
                                          fontSize: 12.sp,
                                          fontWeight: FontWeight.w600,
                                          color: isActive
                                              ? AppColors.background
                                              : AppColors.textSecondary)),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      SizedBox(height: 4.h),
                    ],
                  ),
                ),
              ),

              p.isLoading
                  ? SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.only(top: 60.h),
                        child: const Center(
                            child: CircularProgressIndicator(color: AppColors.primary)),
                      ),
                    )
                  : tickets.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 40.h),
                            child: _empty(context),
                          ),
                        )
                      : SliverPadding(
                          padding: EdgeInsets.symmetric(horizontal: 16.w),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (ctx, i) {
                                final t = tickets[i];
                                final clientName = (t['companyName'] ??
                                    t['clientName'] ??
                                    t['clientId']?['name'] ??
                                    'Unknown').toString();
                                final service = (t['service'] ??
                                    t['topicName'] ??
                                    t['hubType'] ??
                                    'N/A').toString();
                                final rawStatus = t['status']?.toString() ?? '';
                                final mappedStatus = _mapStatus(rawStatus);
                                final ticketId = t['_id']?.toString().toUpperCase().substring(0, 6) ?? '------';
                                final createdDate = _formatDate(t['createdAt']?.toString());
                                final updatedAgo = _timeAgo(t['updatedAt']?.toString() ?? t['createdAt']?.toString());
                                final vertical = (t['hubType'] ?? t['vertical'] ?? 'claim').toString().toLowerCase();

                                return _TicketCard(
                                  ticketId: ticketId,
                                  clientName: clientName,
                                  service: service,
                                  status: mappedStatus,
                                  vertical: vertical,
                                  createdDate: createdDate,
                                  updatedAgo: updatedAgo,
                                  index: i,
                                )
                                    .animate(delay: (40 * i).ms)
                                    .fadeIn(duration: 300.ms)
                                    .slideY(begin: 0.05);
                              },
                              childCount: tickets.length,
                            ),
                          ),
                        ),

              SliverToBoxAdapter(child: SizedBox(height: 120.h)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _empty(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 48.h),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          Icon(Icons.receipt_long_outlined, color: AppColors.textSecondary, size: 40.sp),
          SizedBox(height: 14.h),
          Text(_filterStatus == 'All' ? 'No tickets found' : 'No $_filterStatus tickets',
              style: GoogleFonts.inter(
                  fontSize: 15.sp, fontWeight: FontWeight.w700, color: context.textColor)),
          SizedBox(height: 6.h),
          Text('Tickets will appear here once clients raise services',
              style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.textSecondary),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// ─── Ticket Stat ─────────────────────────────────────────────
class _TicketStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _TicketStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 10.h),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10.r),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(value,
                style: GoogleFonts.inter(
                    fontSize: 16.sp, fontWeight: FontWeight.w800, color: color)),
            SizedBox(height: 2.h),
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 9.sp, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

// ─── Ticket Card ─────────────────────────────────────────────
class _TicketCard extends StatelessWidget {
  final String ticketId;
  final String clientName;
  final String service;
  final String status;
  final String vertical;
  final String createdDate;
  final String updatedAgo;
  final int index;

  const _TicketCard({
    required this.ticketId,
    required this.clientName,
    required this.service,
    required this.status,
    required this.vertical,
    required this.createdDate,
    required this.updatedAgo,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    // Status colors
    Color statusBg, statusFg;
    IconData statusIcon;
    switch (status) {
      case 'Completed':
        statusBg = AppColors.success.withValues(alpha: 0.12);
        statusFg = AppColors.success;
        statusIcon = Icons.check_circle_outline_rounded;
        break;
      case 'In Process':
        statusBg = AppColors.warning.withValues(alpha: 0.12);
        statusFg = AppColors.warning;
        statusIcon = Icons.sync_rounded;
        break;
      default:
        statusBg = AppColors.primary.withValues(alpha: 0.12);
        statusFg = AppColors.primary;
        statusIcon = Icons.radio_button_checked_rounded;
    }

    // Vertical badge
    Color vertColor;
    String vertLabel;
    switch (vertical.toLowerCase()) {
      case 'claim':
        vertColor = const Color(0xFF8B5CF6);
        vertLabel = 'Claim Hub';
        break;
      case 'service':
        vertColor = const Color(0xFF0EA5E9);
        vertLabel = 'Service Hub';
        break;
      default:
        vertColor = AppColors.warning;
        vertLabel = 'Store';
    }

    return Container(
      margin: EdgeInsets.only(bottom: 10.h),
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Ticket ID
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: context.backgroundColor,
                  borderRadius: BorderRadius.circular(6.r),
                ),
                child: Text('#$ticketId',
                    style: GoogleFonts.inter(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                        fontFeatures: [const FontFeature.tabularFigures()])),
              ),
              SizedBox(width: 8.w),
              // Vertical badge
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: vertColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6.r),
                ),
                child: Text(vertLabel,
                    style: GoogleFonts.inter(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w700,
                        color: vertColor)),
              ),
              const Spacer(),
              // Status badge
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(20.r),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIcon, color: statusFg, size: 10.sp),
                    SizedBox(width: 4.w),
                    Text(status,
                        style: GoogleFonts.inter(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w700,
                            color: statusFg)),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Text(service,
              style: GoogleFonts.inter(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: context.textColor)),
          SizedBox(height: 4.h),
          Row(
            children: [
              Icon(Icons.person_outline_rounded,
                  color: AppColors.textSecondary, size: 13.sp),
              SizedBox(width: 4.w),
              Text(clientName,
                  style: GoogleFonts.inter(
                      fontSize: 12.sp, color: AppColors.textSecondary)),
            ],
          ),
          SizedBox(height: 10.h),
          Row(
            children: [
              if (createdDate.isNotEmpty) ...[
                Icon(Icons.calendar_today_outlined,
                    color: AppColors.textSecondary, size: 11.sp),
                SizedBox(width: 4.w),
                Text('Created $createdDate',
                    style: GoogleFonts.inter(
                        fontSize: 10.sp, color: AppColors.textSecondary)),
              ],
              const Spacer(),
              if (updatedAgo.isNotEmpty)
                Text('Updated $updatedAgo',
                    style: GoogleFonts.inter(
                        fontSize: 10.sp,
                        color: AppColors.textSecondary.withValues(alpha: 0.7))),
            ],
          ),
        ],
      ),
    );
  }
}
