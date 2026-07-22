import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../utils/constants.dart';

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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ────────────────────────────────
            Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Services', style: TextStyle(fontSize: 22.sp, fontWeight: FontWeight.w900, color: AppColors.text, letterSpacing: -0.5)),
                  Text('Manage your tickets & support requests', style: TextStyle(fontSize: 12.sp, color: AppColors.textSecondary)),
                ])),
                _NewTicketBtn(onTap: () => _showNewTicketSheet(context)),
              ]),
            ),

            SizedBox(height: 16.h),

            // ── Tabs ──────────────────────────────────
            Container(
              margin: EdgeInsets.symmetric(horizontal: 16.w),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12.r)),
              child: TabBar(
                controller: _tabController,
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textSecondary,
                indicator: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(10.r)),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelStyle: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700),
                padding: EdgeInsets.all(4.r),
                tabs: [Tab(text: 'All Tickets'), Tab(text: 'Open'), Tab(text: 'Closed')],
              ),
            ),

            SizedBox(height: 12.h),

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
      ),
    );
  }

  void _showNewTicketSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: const _NewTicketSheet(),
      ),
    );
  }
}

class _TicketsList extends StatelessWidget {
  final String filter;
  const _TicketsList({required this.filter});

  @override
  Widget build(BuildContext context) {
    final allTickets = [
      {'id': 'TKT-1001', 'service': 'IEPF Claim Recovery', 'status': 'open', 'priority': 'high', 'date': 'Jun 10, 2026', 'lastUpdate': 'Documents reviewed', 'icon': '🏦'},
      {'id': 'TKT-1002', 'service': 'Duplicate Share Certificate', 'status': 'open', 'priority': 'medium', 'date': 'Jun 2, 2026', 'lastUpdate': 'Waiting for response', 'icon': '📜'},
      {'id': 'TKT-1003', 'service': 'GST Filing Support', 'status': 'closed', 'priority': 'low', 'date': 'May 18, 2026', 'lastUpdate': 'Completed', 'icon': '📊'},
      {'id': 'TKT-1004', 'service': 'Share Transfer to Demat', 'status': 'open', 'priority': 'high', 'date': 'Jun 15, 2026', 'lastUpdate': 'In review', 'icon': '💼'},
    ];

    final filtered = filter == 'all' ? allTickets : allTickets.where((t) => t['status'] == filter).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('🎉', style: TextStyle(fontSize: 52.sp)),
          SizedBox(height: 12.h),
          Text('No tickets here', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: AppColors.text)),
          SizedBox(height: 4.h),
          Text('All clear!', style: TextStyle(fontSize: 13.sp, color: AppColors.textSecondary)),
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
    final priority = ticket['priority'] as String;
    Color priorityColor = priority == 'high' ? AppColors.error : priority == 'medium' ? AppColors.warning : AppColors.accent;

    return GestureDetector(
      onTap: () => _showTicketDetail(context),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface, borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: (isOpen ? AppColors.accent : AppColors.textSecondary).withValues(alpha: 0.15), width: 1),
        ),
        child: Padding(
          padding: EdgeInsets.all(14.r),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Text(ticket['icon'] as String, style: TextStyle(fontSize: 24.sp)),
                SizedBox(width: 12.w),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(ticket['service'] as String, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: AppColors.text)),
                  Text(ticket['id'] as String, style: TextStyle(fontSize: 11.sp, color: AppColors.textSecondary)),
                ])),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                    decoration: BoxDecoration(
                      color: (isOpen ? AppColors.accent : AppColors.textSecondary).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(99.r),
                    ),
                    child: Text(isOpen ? 'Open' : 'Closed', style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w800, color: isOpen ? AppColors.accent : AppColors.textSecondary)),
                  ),
                  SizedBox(height: 4.h),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                    decoration: BoxDecoration(color: priorityColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(99.r)),
                    child: Text(priority.toUpperCase(), style: TextStyle(fontSize: 8.sp, fontWeight: FontWeight.w800, color: priorityColor, letterSpacing: 0.5)),
                  ),
                ]),
              ]),
              SizedBox(height: 10.h),
              Container(height: 1, color: Colors.white.withValues(alpha: 0.05)),
              SizedBox(height: 10.h),
              Row(children: [
                Icon(Icons.update_rounded, color: AppColors.textSecondary, size: 14.sp),
                SizedBox(width: 6.w),
                Text(ticket['lastUpdate'] as String, style: TextStyle(fontSize: 11.sp, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                Spacer(),
                Text(ticket['date'] as String, style: TextStyle(fontSize: 11.sp, color: AppColors.textSecondary)),
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
      backgroundColor: AppColors.surface,
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
            Text(ticket['service'] as String, style: TextStyle(fontSize: 17.sp, fontWeight: FontWeight.w900, color: AppColors.text)),
            Text(ticket['id'] as String, style: TextStyle(fontSize: 12.sp, color: AppColors.textSecondary)),
          ])),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
            decoration: BoxDecoration(color: (isOpen ? AppColors.accent : AppColors.textSecondary).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(99.r)),
            child: Text(isOpen ? 'Open' : 'Closed', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w800, color: isOpen ? AppColors.accent : AppColors.textSecondary)),
          ),
        ]),
        SizedBox(height: 20.h),
        Text('Ticket Timeline', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: AppColors.text)),
        SizedBox(height: 12.h),
        ...['Ticket Created', 'Assigned to Agent', 'Documents Requested', 'Under Review'].asMap().entries.map((e) {
          final isDone = e.key < 3;
          return Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Row(children: [
              Container(width: 24, height: 24, decoration: BoxDecoration(color: isDone ? AppColors.accent.withValues(alpha: 0.2) : AppColors.surface, shape: BoxShape.circle, border: Border.all(color: isDone ? AppColors.accent : AppColors.textSecondary.withValues(alpha: 0.3), width: 2)),
                child: isDone ? Icon(Icons.check_rounded, size: 12.sp, color: AppColors.accent) : null),
              SizedBox(width: 12.w),
              Text(e.value, style: TextStyle(fontSize: 13.sp, color: isDone ? AppColors.text : AppColors.textSecondary, fontWeight: isDone ? FontWeight.w700 : FontWeight.w500)),
            ]),
          );
        }),
        SizedBox(height: 20.h),
        if (isOpen) ...[
          TextField(
            maxLines: 3,
            style: TextStyle(color: AppColors.text, fontSize: 13.sp),
            decoration: InputDecoration(hintText: 'Add a reply or note...', hintStyle: TextStyle(color: AppColors.textSecondary), filled: true, fillColor: AppColors.background, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none)),
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
          Text('Raise a Support Ticket', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: AppColors.text)),
          SizedBox(height: 4.h),
          Text('Select a service and describe your issue', style: TextStyle(fontSize: 12.sp, color: AppColors.textSecondary)),
          SizedBox(height: 20.h),
          Text('Service', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          SizedBox(height: 8.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w),
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12.r)),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedService,
                dropdownColor: AppColors.surface,
                isExpanded: true,
                style: TextStyle(color: AppColors.text, fontSize: 13.sp, fontWeight: FontWeight.w600),
                items: _services.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setState(() => _selectedService = v!),
              ),
            ),
          ),
          SizedBox(height: 14.h),
          Text('Priority', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
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
                  color: isSelected ? c.withValues(alpha: 0.15) : AppColors.background,
                  borderRadius: BorderRadius.circular(99.r),
                  border: Border.all(color: isSelected ? c : Colors.white.withValues(alpha: 0.08), width: 1),
                ),
                child: Text(p[0].toUpperCase() + p.substring(1), style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: isSelected ? c : AppColors.textSecondary)),
              ),
            );
          }).toList()),
          SizedBox(height: 14.h),
          Text('Notes', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          SizedBox(height: 8.h),
          TextField(
            controller: _notesCtrl,
            maxLines: 3,
            style: TextStyle(color: AppColors.text, fontSize: 13.sp),
            decoration: InputDecoration(hintText: 'Describe your issue...', hintStyle: TextStyle(color: AppColors.textSecondary), filled: true, fillColor: AppColors.background, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none)),
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
