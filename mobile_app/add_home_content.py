import sys

with open('lib/screens/home_screen.dart', 'r') as f:
    content = f.read()

# Replace the specific lines inside build()
insertion_target = '''                      const _QuickActionsRow(),
                      SizedBox(height: 100.h), // padding for bottom nav'''

insertion_replacement = '''                      const _QuickActionsRow(),
                      SizedBox(height: 28.h),

                      // 6. Referral Banner
                      const _ReferralBanner(),
                      SizedBox(height: 28.h),

                      // 7. Recent Activity
                      const _RecentActivitySection(),
                      SizedBox(height: 28.h),

                      // 8. Helpful Resources
                      const _HelpfulResourcesSection(),
                      
                      SizedBox(height: 120.h), // padding for bottom nav'''

content = content.replace(insertion_target, insertion_replacement)

# Append new widget classes at the end of the file
new_widgets = '''

class _ReferralBanner extends StatelessWidget {
  const _ReferralBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
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
              _buildResourceCard(context, 'Understanding IEPF', 'What you need to know before filing.', Icons.menu_book_rounded),
              SizedBox(width: 12.w),
              _buildResourceCard(context, 'Tax Implications', 'How recovered shares affect your taxes.', Icons.account_balance_rounded),
              SizedBox(width: 12.w),
              _buildResourceCard(context, 'Legal Heir guide', 'Documentation for inherited shares.', Icons.family_restroom_rounded),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 700.ms).slideX(begin: 0.1);
  }

  Widget _buildResourceCard(BuildContext context, String title, String desc, IconData icon) {
    return Container(
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
    );
  }
}
'''

content = content + new_widgets

with open('lib/screens/home_screen.dart', 'w') as f:
    f.write(content)
