import sys

with open('lib/screens/home_screen.dart', 'r') as f:
    home = f.read()

# Replace the insertion point below Helpful Resources
old_padding = '''                      // 8. Helpful Resources
                      const _HelpfulResourcesSection(),
                      
                      SizedBox(height: 120.h), // padding for bottom nav'''

new_support = '''                      // 8. Helpful Resources
                      const _HelpfulResourcesSection(),
                      SizedBox(height: 28.h),
                      
                      // 9. Need Help Section
                      const _NeedHelpCard(),
                      
                      SizedBox(height: 120.h), // padding for bottom nav'''

home = home.replace(old_padding, new_support)

# Append the new Widget class
new_widget = '''
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
'''

home = home + new_widget

with open('lib/screens/home_screen.dart', 'w') as f:
    f.write(home)

