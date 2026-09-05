import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
                padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Services', style: GoogleFonts.poppins(fontSize: 22.sp, fontWeight: FontWeight.w800, color: Colors.white)),
                              Text('Manage your tickets & support requests', style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.white70)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),
                    TabBar(
                      controller: _tabController,
                      tabs: [Tab(text: 'All Tickets'), Tab(text: 'Open'), Tab(text: 'Closed')],
                      indicator: const BoxDecoration(),
                      indicatorSize: TabBarIndicatorSize.tab,
                      dividerColor: Colors.transparent,
                      labelColor: Colors.white,
                      unselectedLabelColor: Colors.white54,
                      labelStyle: GoogleFonts.poppins(fontSize: 13.sp, fontWeight: FontWeight.w700),
                      unselectedLabelStyle: GoogleFonts.poppins(fontSize: 13.sp, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SizedBox(height: 8.h),

          // ── Tab Content ───────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _TicketsList(filter: 'all'),
                _TicketsList(filter: 'open'),
                _TicketsList(filter: 'closed'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showNewTicketSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: const _NewTicketSheet(),
      ),
    );
  }
}

class _TicketsList extends StatefulWidget {
  final String filter;
  const _TicketsList({required this.filter});

  @override
  State<_TicketsList> createState() => _TicketsListState();
}

class _TicketsListState extends State<_TicketsList> {
  bool _isLoading = true;
  List<dynamic> _allTickets = [];

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    final tickets = await ApiService.getTickets();
    if (mounted) {
      setState(() {
        _allTickets = tickets;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    final filtered = widget.filter == 'all' 
        ? _allTickets 
        : _allTickets.where((t) => t['status'] == widget.filter).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('🎉', style: TextStyle(fontSize: 52.sp)),
          SizedBox(height: 12.h),
          Text('No tickets here', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: context.textColor)),
          SizedBox(height: 4.h),
          Text('All clear!', style: TextStyle(fontSize: 13.sp, color: context.textSecondaryColor)),
        ]),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      itemCount: filtered.length,
      itemBuilder: (_, i) => Padding(
        padding: EdgeInsets.only(bottom: 10),
        child: _TicketCard(ticket: filtered[i])
            .animate(delay: Duration(milliseconds: i * 70)).fade().slideY(begin: 0.05),
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;
  const _TicketCard({required this.ticket});

  @override
  Widget build(BuildContext context) {
    final isOpen = ticket['status'] == 'open';
    final priority = (ticket['priority'] ?? 'medium').toString();
    final Color priorityColor = priority == 'high'
        ? const Color(0xFFE74C3C)
        : priority == 'medium'
            ? const Color(0xFFF5A623)
            : const Color(0xFF2ECC71);
    final Color statusColor = isOpen ? const Color(0xFF2ECC71) : context.textSecondaryColor;

    final String icon = (ticket['icon'] ?? '🎫').toString();
    final String service = (ticket['service'] ?? ticket['subject'] ?? 'Support Ticket').toString();
    final String id = (ticket['id'] ?? ticket['_id'] ?? 'TKT-????').toString();
    
    return GestureDetector(
      onTap: () => _showTicketDetail(context),
      child: Container(
        decoration: BoxDecoration(
          color: context.isDark ? const Color(0xFF1A1F2E) : context.surfaceColor,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: isOpen
                ? const Color(0xFF2ECC71).withValues(alpha: 0.2)
                : context.borderColor,
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: context.isDark ? 0.25 : 0.06),
              blurRadius: 10, offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(16.r),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon box
                  Container(
                    width: 46, height: 46,
                    decoration: BoxDecoration(
                      color: context.isDark
                          ? Colors.white.withValues(alpha: 0.07)
                          : context.backgroundColor,
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(color: context.borderColor),
                    ),
                    child: Center(
                      child: Text(icon, style: TextStyle(fontSize: 22.sp)),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service,
                          style: GoogleFonts.poppins(
                            fontSize: 14.sp, fontWeight: FontWeight.w800, color: context.textColor,
                          ),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          id,
                          style: GoogleFonts.poppins(
                            fontSize: 11.sp, color: context.textSecondaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 8.w),
                  // Status + Priority column
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20.r),
                          border: Border.all(color: statusColor.withValues(alpha: 0.4), width: 1),
                        ),
                        child: Text(
                          isOpen ? 'Open' : 'Closed',
                          style: GoogleFonts.poppins(fontSize: 10.sp, fontWeight: FontWeight.w700, color: statusColor),
                        ),
                      ),
                      SizedBox(height: 5.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                        decoration: BoxDecoration(
                          color: priorityColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6.r),
                        ),
                        child: Text(
                          priority.toUpperCase(),
                          style: GoogleFonts.poppins(
                            fontSize: 9.sp, fontWeight: FontWeight.w900,
                            color: priorityColor, letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              SizedBox(height: 12.h),
              Divider(color: context.borderColor, height: 1),
              SizedBox(height: 12.h),

              // Footer
              Row(children: [
                Icon(Icons.update_rounded, color: context.textSecondaryColor, size: 14.sp),
                SizedBox(width: 6.w),
                Text(
                  (ticket['lastUpdate'] ?? 'Recently').toString(),
                  style: GoogleFonts.poppins(fontSize: 11.sp, color: context.textSecondaryColor, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text(
                  (ticket['date'] ?? ticket['createdAt']?.toString().split('T').first ?? 'Today').toString(),
                  style: GoogleFonts.poppins(fontSize: 11.sp, color: context.textSecondaryColor),
                ),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  void _showTicketDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        builder: (_, ctrl) => _TicketDetailSheet(ticket: ticket, scrollController: ctrl),
      ),
    );
  }
}

class _TicketDetailSheet extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final ScrollController scrollController;
  const _TicketDetailSheet({required this.ticket, required this.scrollController});

  @override
  Widget build(BuildContext context) {
    final isOpen = ticket['status'] == 'open';

    return ListView(
      controller: scrollController,
      padding: EdgeInsets.all(20.r),
      children: [
        Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)))),
        SizedBox(height: 20.h),
        Row(children: [
          Text(ticket['icon'] as String, style: TextStyle(fontSize: 28.sp)),
          SizedBox(width: 14.w),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(ticket['service'] as String, style: TextStyle(fontSize: 17.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            Text(ticket['id'] as String, style: TextStyle(fontSize: 12.sp, color: context.textSecondaryColor)),
          ])),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
            decoration: BoxDecoration(color: (isOpen ? AppColors.accent : context.textSecondaryColor).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(99.r)),
            child: Text(isOpen ? 'Open' : 'Closed', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w800, color: isOpen ? AppColors.accent : context.textSecondaryColor)),
          ),
        ]),
        SizedBox(height: 20.h),
        Text('Ticket Timeline', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: context.textColor)),
        SizedBox(height: 12.h),
        ...['Ticket Created', 'Assigned to Agent', 'Documents Requested', 'Under Review'].asMap().entries.map((e) {
          final isDone = e.key < 3;
          return Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Row(children: [
              Container(width: 24, height: 24, decoration: BoxDecoration(color: isDone ? AppColors.accent.withValues(alpha: 0.2) : context.surfaceColor, shape: BoxShape.circle, border: Border.all(color: isDone ? AppColors.accent : context.textSecondaryColor.withValues(alpha: 0.3), width: 2)),
                child: isDone ? Icon(Icons.check_rounded, size: 12.sp, color: AppColors.accent) : null),
              SizedBox(width: 12.w),
              Text(e.value, style: TextStyle(fontSize: 13.sp, color: isDone ? context.textColor : context.textSecondaryColor, fontWeight: isDone ? FontWeight.w700 : FontWeight.w500)),
            ]),
          );
        }),
        SizedBox(height: 20.h),
        if (isOpen) ...[
          TextField(
            maxLines: 3,
            style: TextStyle(color: context.textColor, fontSize: 13.sp),
            decoration: InputDecoration(hintText: 'Add a reply or note...', hintStyle: TextStyle(color: context.textSecondaryColor), filled: true, fillColor: context.backgroundColor, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none)),
          ),
          SizedBox(height: 12.h),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent, foregroundColor: Colors.white, padding: EdgeInsets.symmetric(vertical: 14.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r))),
            child: Text('Send Reply', style: TextStyle(fontWeight: FontWeight.w800)),
          )),
        ],
        SizedBox(height: 20.h),
      ],
    );
  }
}

class _NewTicketBtn extends StatelessWidget {
  final VoidCallback onTap;
  const _NewTicketBtn({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 9.h),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [AppColors.accent, AppColors.accentDark]),
          borderRadius: BorderRadius.circular(12.r),
          boxShadow: [BoxShadow(color: AppColors.accent.withValues(alpha: 0.35), blurRadius: 12, offset: Offset(0, 4))],
        ),
        child: Row(children: [
          Icon(Icons.add_rounded, color: Colors.white, size: 16.sp),
          SizedBox(width: 4.w),
          Text('New Ticket', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13.sp)),
        ]),
      ),
    );
  }
}

class _NewTicketSheet extends StatefulWidget {
  const _NewTicketSheet();

  @override
  State<_NewTicketSheet> createState() => _NewTicketSheetState();
}

class _NewTicketSheetState extends State<_NewTicketSheet> {
  String _selectedService = 'IEPF Claim';
  String _priority = 'medium';
  final _notesCtrl = TextEditingController();

  final _services = ['IEPF Claim', 'Duplicate Share', 'Share Transfer', 'Dividend Recovery', 'GST Filing', 'Legal Support'];
  final _priorities = ['low', 'medium', 'high'];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(24.r),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)))),
          SizedBox(height: 20.h),
          Text('Raise a Support Ticket', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: context.textColor)),
          SizedBox(height: 4.h),
          Text('Select a service and describe your issue', style: TextStyle(fontSize: 12.sp, color: context.textSecondaryColor)),
          SizedBox(height: 20.h),
          Text('Service', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: context.textSecondaryColor)),
          SizedBox(height: 8.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w),
            decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12.r)),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedService,
                dropdownColor: context.surfaceColor,
                isExpanded: true,
                style: TextStyle(color: context.textColor, fontSize: 13.sp, fontWeight: FontWeight.w600),
                items: _services.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setState(() => _selectedService = v!),
              ),
            ),
          ),
          SizedBox(height: 14.h),
          Text('Priority', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: context.textSecondaryColor)),
          SizedBox(height: 8.h),
          Row(children: _priorities.map((p) {
            final isSelected = _priority == p;
            Color c = p == 'high' ? AppColors.error : p == 'medium' ? AppColors.warning : AppColors.accent;
            return GestureDetector(
              onTap: () => setState(() => _priority = p),
              child: AnimatedContainer(
                duration: Duration(milliseconds: 200),
                margin: EdgeInsets.only(right: 8),
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                decoration: BoxDecoration(
                  color: isSelected ? c.withValues(alpha: 0.15) : context.backgroundColor,
                  borderRadius: BorderRadius.circular(99.r),
                  border: Border.all(color: isSelected ? c : context.borderColor, width: 1),
                ),
                child: Text(p[0].toUpperCase() + p.substring(1), style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: isSelected ? c : context.textSecondaryColor)),
              ),
            );
          }).toList()),
          SizedBox(height: 14.h),
          Text('Notes', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: context.textSecondaryColor)),
          SizedBox(height: 8.h),
          TextField(
            controller: _notesCtrl,
            maxLines: 3,
            style: TextStyle(color: context.textColor, fontSize: 13.sp),
            decoration: InputDecoration(hintText: 'Describe your issue...', hintStyle: TextStyle(color: context.textSecondaryColor), filled: true, fillColor: context.backgroundColor, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none)),
          ),
          SizedBox(height: 20.h),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent, foregroundColor: Colors.white, padding: EdgeInsets.symmetric(vertical: 14.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r))),
            child: Text('Submit Ticket', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15.sp)),
          )),
          SizedBox(height: 8.h),
        ],
      ),
    );
  }
}
