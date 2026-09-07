import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/partner_dashboard_provider.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class PartnerLeadsScreen extends StatefulWidget {
  const PartnerLeadsScreen({super.key});

  @override
  State<PartnerLeadsScreen> createState() => _PartnerLeadsScreenState();
}

class _PartnerLeadsScreenState extends State<PartnerLeadsScreen> {
  String _search = '';
  String _filterStatus = 'All';
  final _searchController = TextEditingController();

  static const _filters = ['All', 'New', 'In Discussion', 'Converted', 'Not Interested'];

  String _mapStatus(String raw) {
    switch (raw.toLowerCase()) {
      case 'converted': return 'Converted';
      case 'in_discussion': return 'In Discussion';
      case 'not_interested': return 'Not Interested';
      default: return 'New';
    }
  }

  Future<void> _onRefresh() async {
    final auth = context.read<AuthProvider>();
    final id = auth.user?['_id']?.toString() ?? '';
    await context.read<PartnerDashboardProvider>().fetchAll(id);
  }

  void _showAddLeadSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AddLeadSheet(),
    ).then((newLead) {
      if (newLead != null) {
        context.read<PartnerDashboardProvider>().addLeadLocally(newLead);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<PartnerDashboardProvider>();
    final allLeads = p.leads.map((l) {
      return {
        ...Map<String, dynamic>.from(l as Map),
        '_mappedStatus': _mapStatus(l['status']?.toString() ?? ''),
      };
    }).toList();

    final filtered = allLeads.where((l) {
      final q = _search.toLowerCase();
      final nameMatch = (l['name']?.toString().toLowerCase() ?? '').contains(q);
      final serviceMatch = (l['serviceInterest']?.toString().toLowerCase() ?? '').contains(q);
      final statusMatch = _filterStatus == 'All' || l['_mappedStatus'] == _filterStatus;
      return (nameMatch || serviceMatch) && statusMatch;
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
              // Header
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
                              Text('Lead Centre',
                                  style: GoogleFonts.inter(
                                      fontSize: 22.sp,
                                      fontWeight: FontWeight.w800,
                                      color: context.textColor)),
                              Text('Manage & track your leads',
                                  style: GoogleFonts.inter(
                                      fontSize: 12.sp,
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                          GestureDetector(
                            onTap: _showAddLeadSheet,
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(12.r),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.35),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.add_rounded,
                                      color: AppColors.background, size: 18.sp),
                                  SizedBox(width: 6.w),
                                  Text('Add Lead',
                                      style: GoogleFonts.inter(
                                          fontSize: 13.sp,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.background)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 16.h),

                      // Stat mini-row
                      Row(
                        children: [
                          _MiniStat('Total', p.totalLeads.toString(), AppColors.purple),
                          SizedBox(width: 10.w),
                          _MiniStat('New', p.newLeads.toString(), AppColors.primary),
                          SizedBox(width: 10.w),
                          _MiniStat('In Discussion', p.inDiscussionLeads.toString(), AppColors.warning),
                          SizedBox(width: 10.w),
                          _MiniStat('Converted', p.convertedLeads.toString(), AppColors.success),
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
                            Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20.sp),
                            SizedBox(width: 8.w),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                onChanged: (v) => setState(() => _search = v),
                                style: GoogleFonts.inter(
                                    fontSize: 14.sp, color: context.textColor),
                                decoration: InputDecoration(
                                  hintText: 'Search leads…',
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
                                  color: isActive
                                      ? AppColors.primary
                                      : context.surfaceColor,
                                  borderRadius: BorderRadius.circular(20.r),
                                  border: Border.all(
                                    color: isActive
                                        ? AppColors.primary
                                        : context.borderColor,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    f,
                                    style: GoogleFonts.inter(
                                        fontSize: 12.sp,
                                        fontWeight: FontWeight.w600,
                                        color: isActive
                                            ? AppColors.background
                                            : AppColors.textSecondary),
                                  ),
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

              // List
              p.isLoading
                  ? SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.only(top: 60.h),
                        child: const Center(
                            child: CircularProgressIndicator(color: AppColors.primary)),
                      ),
                    )
                  : filtered.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 40.h),
                            child: _EmptyState(
                              icon: Icons.people_outline_rounded,
                              title: _search.isNotEmpty
                                  ? 'No results found'
                                  : 'No leads yet',
                              subtitle: _search.isNotEmpty
                                  ? 'Try a different search term'
                                  : 'Tap "Add Lead" to create your first lead',
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: EdgeInsets.symmetric(horizontal: 16.w),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (ctx, i) {
                                final lead = filtered[i];
                                return _LeadCard(lead: lead, index: i)
                                    .animate(delay: (40 * i).ms)
                                    .fadeIn(duration: 300.ms)
                                    .slideY(begin: 0.05);
                              },
                              childCount: filtered.length,
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
}

// ─── Mini Stat ────────────────────────────────────────────────
class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _MiniStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 10.h, horizontal: 8.w),
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
                style: GoogleFonts.inter(fontSize: 9.sp, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

// ─── Lead Card ────────────────────────────────────────────────
class _LeadCard extends StatelessWidget {
  final Map<String, dynamic> lead;
  final int index;
  const _LeadCard({required this.lead, required this.index});

  static const _avatarColors = [
    Color(0xFF6366F1), Color(0xFF10B981), Color(0xFF0EA5E9),
    Color(0xFFF59E0B), Color(0xFF8B5CF6), Color(0xFFEF4444),
  ];

  String _formatDate(String? iso) {
    if (iso == null || iso.isEmpty) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = lead['name']?.toString() ?? 'Unknown';
    final phone = lead['phone']?.toString() ?? '—';
    final service = lead['serviceInterest']?.toString() ?? 'N/A';
    final status = lead['_mappedStatus']?.toString() ?? 'New';
    final date = _formatDate(lead['createdAt']?.toString());
    final initials = name.trim().isEmpty ? '?' : name.trim().split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join().toUpperCase();
    final color = _avatarColors[index % _avatarColors.length];

    Color statusBg, statusFg;
    switch (status) {
      case 'Converted':
        statusBg = AppColors.success.withValues(alpha: 0.12);
        statusFg = AppColors.success;
        break;
      case 'In Discussion':
        statusBg = AppColors.warning.withValues(alpha: 0.12);
        statusFg = AppColors.warning;
        break;
      case 'Not Interested':
        statusBg = AppColors.error.withValues(alpha: 0.12);
        statusFg = AppColors.error;
        break;
      default:
        statusBg = AppColors.purple.withValues(alpha: 0.12);
        statusFg = AppColors.purple;
    }

    return Container(
      margin: EdgeInsets.only(bottom: 10.h),
      padding: EdgeInsets.all(14.r),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 44.w,
            height: 44.w,
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
          ),
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
                Text(phone,
                    style: GoogleFonts.inter(
                        fontSize: 11.sp, color: AppColors.textSecondary)),
                SizedBox(height: 4.h),
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                      decoration: BoxDecoration(
                        color: context.backgroundColor,
                        borderRadius: BorderRadius.circular(6.r),
                      ),
                      child: Text(service,
                          style: GoogleFonts.inter(
                              fontSize: 10.sp,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600)),
                    ),
                    if (date.isNotEmpty) ...[
                      SizedBox(width: 6.w),
                      Text('· $date',
                          style: GoogleFonts.inter(
                              fontSize: 10.sp, color: AppColors.textSecondary)),
                    ],
                  ],
                ),
              ],
            ),
          ),
          SizedBox(width: 8.w),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
            decoration: BoxDecoration(
              color: statusBg,
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Text(status,
                style: GoogleFonts.inter(
                    fontSize: 10.sp, fontWeight: FontWeight.w700, color: statusFg)),
          ),
        ],
      ),
    );
  }
}

// ─── Add Lead Bottom Sheet ─────────────────────────────────────
class AddLeadSheet extends StatefulWidget {
  const AddLeadSheet();

  @override
  State<AddLeadSheet> createState() => AddLeadSheetState();
}

class AddLeadSheetState extends State<AddLeadSheet> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  String _service = '';
  bool _submitting = false;

  static const _services = [
    'IEPF Claim', 'Share Recovery', 'Duplicate Share Issuance',
    'GST Filing', 'Company Registration', 'Legal Documentation',
    'Pre-IPO Buy', 'Pre-IPO Sell', 'Other',
  ];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);

    final auth = context.read<AuthProvider>();
    final payload = {
      'name': '${_firstNameCtrl.text.trim()} ${_lastNameCtrl.text.trim()}',
      'phone': '+91 ${_phoneCtrl.text.trim()}',
      'serviceInterest': _service.isNotEmpty ? _service : 'N/A',
      'permanentAddress': _addressCtrl.text.trim(),
      'sourceUserId': auth.user?['_id'],
    };

    final result = await ApiService.createLead(payload);
    if (!mounted) return;
    setState(() => _submitting = false);

    if (result['success'] == true) {
      Navigator.pop(context, result['data']);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lead added successfully!',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r)),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Failed to add lead',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r)),
        ),
      );
    }
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.6,
      expand: false,
      builder: (_, scrollCtrl) => Container(
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        ),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Handle
              Center(
                child: Container(
                  margin: EdgeInsets.only(top: 12.h, bottom: 20.h),
                  width: 40.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: context.borderColor,
                    borderRadius: BorderRadius.circular(2.r),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8.r),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      child: Icon(Icons.person_add_alt_1_rounded,
                          color: AppColors.primary, size: 20.sp),
                    ),
                    SizedBox(width: 12.w),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Add New Lead',
                            style: GoogleFonts.inter(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w800,
                                color: context.textColor)),
                        Text('Fill in the lead details below',
                            style: GoogleFonts.inter(
                                fontSize: 12.sp, color: AppColors.textSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
              SizedBox(height: 20.h),
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  children: [
                    Row(
                      children: [
                        Expanded(child: _Field(ctrl: _firstNameCtrl, label: 'First Name', hint: 'Rahul', required: true)),
                        SizedBox(width: 12.w),
                        Expanded(child: _Field(ctrl: _lastNameCtrl, label: 'Last Name', hint: 'Sharma', required: true)),
                      ],
                    ),
                    SizedBox(height: 16.h),
                    _Field(ctrl: _phoneCtrl, label: 'Phone Number', hint: '98765 43210',
                        prefix: '+91 ', keyboardType: TextInputType.phone, required: true),
                    SizedBox(height: 16.h),
                    // Service dropdown
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('SERVICE INTEREST',
                            style: GoogleFonts.inter(
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textSecondary,
                                letterSpacing: 0.8)),
                        SizedBox(height: 6.h),
                        Container(
                          height: 50.h,
                          padding: EdgeInsets.symmetric(horizontal: 14.w),
                          decoration: BoxDecoration(
                            color: context.backgroundColor,
                            borderRadius: BorderRadius.circular(12.r),
                            border: Border.all(color: context.borderColor),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _service.isEmpty ? null : _service,
                              hint: Text('Select service…',
                                  style: GoogleFonts.inter(
                                      fontSize: 14.sp, color: AppColors.textSecondary)),
                              isExpanded: true,
                              dropdownColor: context.surfaceColor,
                              style: GoogleFonts.inter(
                                  fontSize: 14.sp, color: context.textColor),
                              items: _services
                                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                                  .toList(),
                              onChanged: (v) => setState(() => _service = v ?? ''),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),
                    _Field(ctrl: _addressCtrl, label: 'Address', hint: 'Enter full address…',
                        maxLines: 3, required: true),
                    SizedBox(height: 32.h),
                    // Submit
                    SizedBox(
                      height: 52.h,
                      child: ElevatedButton(
                        onPressed: _submitting ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.background,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14.r),
                          ),
                        ),
                        child: _submitting
                            ? SizedBox(
                                width: 22.w,
                                height: 22.w,
                                child: CircularProgressIndicator(
                                    color: AppColors.background,
                                    strokeWidth: 2.5),
                              )
                            : Text('Submit Lead',
                                style: GoogleFonts.inter(
                                    fontSize: 15.sp, fontWeight: FontWeight.w700)),
                      ),
                    ),
                    SizedBox(height: 32.h),
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

class _Field extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final String hint;
  final String? prefix;
  final bool required;
  final int maxLines;
  final TextInputType keyboardType;

  const _Field({
    required this.ctrl,
    required this.label,
    required this.hint,
    this.prefix,
    this.required = false,
    this.maxLines = 1,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label.toUpperCase(),
                style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                    letterSpacing: 0.8)),
            if (required)
              Text(' *',
                  style: TextStyle(color: AppColors.error, fontSize: 10.sp)),
          ],
        ),
        SizedBox(height: 6.h),
        TextFormField(
          controller: ctrl,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: GoogleFonts.inter(fontSize: 14.sp, color: context.textColor),
          decoration: InputDecoration(
            hintText: hint,
            prefixText: prefix,
            prefixStyle: GoogleFonts.inter(
                fontSize: 14.sp, color: AppColors.textSecondary),
            hintStyle: GoogleFonts.inter(
                fontSize: 14.sp, color: AppColors.textSecondary),
            filled: true,
            fillColor: context.backgroundColor,
            contentPadding:
                EdgeInsets.symmetric(horizontal: 14.w, vertical: 14.h),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: context.borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: context.borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
          ),
          validator: required
              ? (v) => (v == null || v.trim().isEmpty) ? 'Required' : null
              : null,
        ),
      ],
    );
  }
}

// ─── Empty State ─────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _EmptyState({required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
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
          Icon(icon, color: AppColors.textSecondary, size: 40.sp),
          SizedBox(height: 14.h),
          Text(title,
              style: GoogleFonts.inter(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w700,
                  color: context.textColor)),
          SizedBox(height: 6.h),
          Text(subtitle,
              style: GoogleFonts.inter(
                  fontSize: 12.sp, color: AppColors.textSecondary),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
