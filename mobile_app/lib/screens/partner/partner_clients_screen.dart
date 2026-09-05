import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/partner_dashboard_provider.dart';
import '../../utils/constants.dart';

class PartnerClientsScreen extends StatefulWidget {
  const PartnerClientsScreen({super.key});

  @override
  State<PartnerClientsScreen> createState() => _PartnerClientsScreenState();
}

class _PartnerClientsScreenState extends State<PartnerClientsScreen> {
  String _search = '';
  final _searchCtrl = TextEditingController();

  Future<void> _onRefresh() async {
    final auth = context.read<AuthProvider>();
    final id = auth.user?['_id']?.toString() ?? '';
    await context.read<PartnerDashboardProvider>().fetchAll(id);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<PartnerDashboardProvider>();
    final clients = p.clients.where((c) {
      final q = _search.toLowerCase();
      if (q.isEmpty) return true;
      return (c['name']?.toString().toLowerCase() ?? '').contains(q) ||
          (c['email']?.toString().toLowerCase() ?? '').contains(q);
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
                              Text('My Clients',
                                  style: GoogleFonts.inter(
                                      fontSize: 22.sp,
                                      fontWeight: FontWeight.w800,
                                      color: context.textColor)),
                              Text('${p.activeClients} active clients',
                                  style: GoogleFonts.inter(
                                      fontSize: 12.sp,
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                          Container(
                            padding: EdgeInsets.all(10.r),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12.r),
                            ),
                            child: Icon(Icons.groups_rounded,
                                color: AppColors.primary, size: 22.sp),
                          ),
                        ],
                      ),
                      SizedBox(height: 16.h),

                      // Summary row
                      Row(
                        children: [
                          _SummaryChip(
                              label: 'Total', value: p.activeClients.toString(), color: AppColors.primary),
                          SizedBox(width: 10.w),
                          _SummaryChip(
                              label: 'Tickets', value: p.openTickets.toString(), color: AppColors.warning),
                          SizedBox(width: 10.w),
                          _SummaryChip(
                              label: 'Completed', value: p.completedTickets.toString(), color: AppColors.success),
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
                                controller: _searchCtrl,
                                onChanged: (v) => setState(() => _search = v),
                                style: GoogleFonts.inter(
                                    fontSize: 14.sp, color: context.textColor),
                                decoration: InputDecoration(
                                  hintText: 'Search clients…',
                                  hintStyle: GoogleFonts.inter(
                                      fontSize: 14.sp, color: AppColors.textSecondary),
                                  border: InputBorder.none,
                                  isDense: true,
                                ),
                              ),
                            ),
                          ],
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
                  : clients.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 40.h),
                            child: _emptyState(context),
                          ),
                        )
                      : SliverPadding(
                          padding: EdgeInsets.symmetric(horizontal: 16.w),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (ctx, i) => _ClientCard(client: clients[i], index: i)
                                  .animate(delay: (40 * i).ms)
                                  .fadeIn(duration: 300.ms)
                                  .slideY(begin: 0.05),
                              childCount: clients.length,
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

  Widget _emptyState(BuildContext context) {
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
          Icon(Icons.groups_outlined, color: AppColors.textSecondary, size: 40.sp),
          SizedBox(height: 14.h),
          Text(_search.isNotEmpty ? 'No results' : 'No clients yet',
              style: GoogleFonts.inter(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: context.textColor)),
          SizedBox(height: 6.h),
          Text(_search.isNotEmpty
              ? 'Try a different search'
              : 'Clients will appear here once leads are converted',
              style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.textSecondary),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// ─── Summary Chip ─────────────────────────────────────────────
class _SummaryChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _SummaryChip({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12.h),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(value,
                style: GoogleFonts.inter(
                    fontSize: 18.sp, fontWeight: FontWeight.w800, color: color)),
            SizedBox(height: 2.h),
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 11.sp, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

// ─── Client Card ─────────────────────────────────────────────
class _ClientCard extends StatelessWidget {
  final dynamic client;
  final int index;

  const _ClientCard({required this.client, required this.index});

  static const _colors = [
    Color(0xFF6366F1), Color(0xFF10B981), Color(0xFF0EA5E9),
    Color(0xFFF59E0B), Color(0xFF8B5CF6), Color(0xFFEF4444),
  ];

  @override
  Widget build(BuildContext context) {
    final name = client['name']?.toString() ?? 'Unknown';
    final email = client['email']?.toString() ?? '—';
    final phone = client['phone']?.toString() ?? '—';
    final initials = name.trim().isEmpty ? '?' : name.trim().split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join().toUpperCase();
    final color = _colors[index % _colors.length];
    final joinDate = _formatDate(client['createdAt']?.toString());

    return Container(
      margin: EdgeInsets.only(bottom: 10.h),
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50.w,
            height: 50.w,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, color.withValues(alpha: 0.7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14.r),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.25),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Center(
              child: Text(initials,
                  style: GoogleFonts.inter(
                      fontSize: 16.sp, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
          ),
          SizedBox(width: 14.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: GoogleFonts.inter(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w700,
                        color: context.textColor)),
                SizedBox(height: 3.h),
                Row(
                  children: [
                    Icon(Icons.mail_outline_rounded,
                        color: AppColors.textSecondary, size: 12.sp),
                    SizedBox(width: 4.w),
                    Expanded(
                      child: Text(email,
                          style: GoogleFonts.inter(
                              fontSize: 11.sp, color: AppColors.textSecondary),
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
                if (phone != '—') ...[
                  SizedBox(height: 2.h),
                  Row(
                    children: [
                      Icon(Icons.phone_outlined,
                          color: AppColors.textSecondary, size: 12.sp),
                      SizedBox(width: 4.w),
                      Text(phone,
                          style: GoogleFonts.inter(
                              fontSize: 11.sp, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Text('Active',
                    style: GoogleFonts.inter(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w700,
                        color: AppColors.success)),
              ),
              if (joinDate.isNotEmpty) ...[
                SizedBox(height: 6.h),
                Text('Since $joinDate',
                    style: GoogleFonts.inter(
                        fontSize: 9.sp, color: AppColors.textSecondary)),
              ],
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(String? iso) {
    if (iso == null || iso.isEmpty) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return '';
    }
  }
}
