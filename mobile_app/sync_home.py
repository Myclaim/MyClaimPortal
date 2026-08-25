import sys

with open('lib/screens/home_screen.dart', 'r') as f:
    home = f.read()

# 1. Update _ReferralBanner
old_banner = '''  Widget build(BuildContext context) {
    return Container('''
new_banner = '''  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen())),
      child: Container('''

home = home.replace(old_banner, new_banner)

old_banner_end = '''          )
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1);
  }'''
new_banner_end = '''          )
        ],
      ),
    )).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1);
  }'''

home = home.replace(old_banner_end, new_banner_end)

# 2. Update Estimated Recovery Value
old_est = '''                  Text(
                    '₹12,45,000',
                    style: GoogleFonts.inter(fontSize: 32.sp, fontWeight: FontWeight.w800, color: Colors.white, height: 1),
                  ),'''
new_est = '''                  Text(
                    dash.overview['estimatedValue']?.toString() ?? dash.overview['estValue']?.toString() ?? '₹12,45,000',
                    style: GoogleFonts.inter(fontSize: 32.sp, fontWeight: FontWeight.w800, color: Colors.white, height: 1),
                  ),'''

home = home.replace(old_est, new_est)

# 3. Update Recent Activity Section
old_recent = '''class _RecentActivitySection extends StatelessWidget {
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
          child: Column(
            children: [
              _buildActivityItem(context, 'Reliance Industries', 'Status changed to IEPF-5 Filing', '2h ago', Icons.update_rounded),
              Divider(color: context.borderColor, height: 1),
              _buildActivityItem(context, 'HDFC Bank Ltd', 'Document Verification complete', 'Yesterday', Icons.check_circle_outline_rounded, isSuccess: true),
              Divider(color: context.borderColor, height: 1),
              _buildActivityItem(context, 'Support Ticket #1024', 'Our agent replied to your query.', 'Yesterday', Icons.support_agent_rounded),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1);
  }'''

new_recent = '''import '../services/api_service.dart';

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
              final notifications = data != null ? data['data'] as List<dynamic>? : null;
              
              if (notifications == null || notifications.isEmpty) {
                return Padding(
                  padding: EdgeInsets.all(16.r),
                  child: Text('No recent activity.', style: GoogleFonts.inter(color: context.textSecondaryColor)),
                );
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
                      if (notif != notifications.take(3).last) Divider(color: context.borderColor, height: 1),
                    ],
                  );
                }).toList(),
              );
            },
          ),
        ),
      ],
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1);
  }'''

home = home.replace(old_recent, new_recent)

with open('lib/screens/home_screen.dart', 'w') as f:
    f.write(home)
