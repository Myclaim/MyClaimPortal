import sys

with open('lib/screens/home_screen.dart', 'r') as f:
    home = f.read()

# Fix the call
home = home.replace('_buildStatsGrid(dash)', '_buildStatsGrid(context, dash)')

# Fix the definition of _buildStatsGrid
home = home.replace('Widget _buildStatsGrid(DashboardProvider dash) {', 'Widget _buildStatsGrid(BuildContext context, DashboardProvider dash) {')
home = home.replace("_buildStatItem('Total Claims', total)", "_buildStatItem(context, 'Total Claims', total)")
home = home.replace("_buildStatItem('Active', active)", "_buildStatItem(context, 'Active', active)")
home = home.replace("_buildStatItem('In Progress', inProgress)", "_buildStatItem(context, 'In Progress', inProgress)")
home = home.replace("_buildStatItem('Completed', completed, isHighlight: true)", "_buildStatItem(context, 'Completed', completed, isHighlight: true)")

# Fix the definition of _buildStatItem
home = home.replace('Widget _buildStatItem(String label, String value, {bool isHighlight = false}) {', 'Widget _buildStatItem(BuildContext context, String label, String value, {bool isHighlight = false}) {')

# Fix the surface color inside _buildStatItem
# From: color: AppColors.surface,
# To: color: context.surfaceColor, border: Border.all(color: context.borderColor, width: 1),
home = home.replace('''        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12.r),
        ),''', '''        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: context.borderColor, width: 1),
        ),''')

# Fix text color in _buildStatItem
# From: color: isHighlight ? AppColors.primary : Colors.white,
# To: color: isHighlight ? AppColors.primary : context.textColor,
home = home.replace('color: isHighlight ? AppColors.primary : Colors.white,', 'color: isHighlight ? AppColors.primary : context.textColor,')

# Fix QuickActionsRow colors
home = home.replace('color: isHighlight ? AppColors.primary : AppColors.surface,', 'color: isHighlight ? AppColors.primary : context.surfaceColor,')
home = home.replace('color: isHighlight ? AppColors.background : AppColors.primary,', 'color: isHighlight ? context.backgroundColor : AppColors.primary,')

# Add border to QuickActionsRow container
home = home.replace('''                decoration: BoxDecoration(
                  color: isHighlight ? AppColors.primary : context.surfaceColor,
                  borderRadius: BorderRadius.circular(16.r),
                ),''', '''                decoration: BoxDecoration(
                  color: isHighlight ? AppColors.primary : context.surfaceColor,
                  borderRadius: BorderRadius.circular(16.r),
                  border: Border.all(color: isHighlight ? AppColors.primary : context.borderColor, width: 1),
                ),''')


with open('lib/screens/home_screen.dart', 'w') as f:
    f.write(home)

# Now fix main_shell.dart
with open('lib/screens/main_shell.dart', 'r') as f:
    shell = f.read()

shell = shell.replace('final navBgColor = AppColors.surface;', 'final navBgColor = context.surfaceColor;')
shell = shell.replace('color: Colors.black.withValues(alpha: 0.5),', 'color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.1),')
shell = shell.replace('border: Border.all(color: context.borderColor),', '')

with open('lib/screens/main_shell.dart', 'w') as f:
    f.write(shell)

