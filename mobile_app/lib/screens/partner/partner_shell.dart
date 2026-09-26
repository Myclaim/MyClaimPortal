import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/auth_provider.dart';
import '../../providers/partner_dashboard_provider.dart';
import '../../utils/constants.dart';
import 'partner_home_screen.dart';
import 'partner_leads_screen.dart';
import 'partner_clients_screen.dart';
import 'partner_tickets_screen.dart';
import 'partner_profile_screen.dart';

class PartnerShell extends StatefulWidget {
  const PartnerShell({super.key});

  @override
  State<PartnerShell> createState() => _PartnerShellState();
}

class _PartnerShellState extends State<PartnerShell> {
  int _currentIndex = 0;

  void _navigate(int index) {
    setState(() => _currentIndex = index);
  }

  late final List<Widget> _screens = [
    PartnerHomeScreen(onNavigate: _navigate),
    const PartnerLeadsScreen(),
    const PartnerClientsScreen(),
    
    const PartnerTicketsScreen(),
    const PartnerProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      final partnerId = auth.user?['_id']?.toString() ?? '';
      context.read<PartnerDashboardProvider>().fetchAll(partnerId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: _PartnerBottomNav(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
      ),
    );
  }
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
class _PartnerBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _PartnerBottomNav({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final navBgColor = context.surfaceColor;
    const activeColor = AppColors.primary;
    final inactiveColor = AppColors.textSecondary;

    final items = [
      (Icons.home_outlined, Icons.home_rounded, 'Home'),
      (Icons.people_outline_rounded, Icons.people_rounded, 'Leads'),
      (Icons.supervised_user_circle_outlined, Icons.supervised_user_circle_rounded, 'Clients'),
      (Icons.receipt_long_outlined, Icons.receipt_long_rounded, 'Tickets'),
      (Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
    ];

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(left: 16.w, right: 16.w, bottom: 16.h),
        child: Container(
          height: 70.h,
          decoration: BoxDecoration(
            color: navBgColor,
            borderRadius: BorderRadius.circular(35.r),
            boxShadow: [
              BoxShadow(
                color: isDark
                    ? Colors.black.withValues(alpha: 0.5)
                    : Colors.black.withValues(alpha: 0.12),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(items.length, (i) {
              final isActive = currentIndex == i;
              final (icon, activeIcon, label) = items[i];
              return Expanded(
                child: GestureDetector(
                  onTap: () => onTap(i),
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        transitionBuilder: (child, anim) =>
                            ScaleTransition(scale: anim, child: child),
                        child: Icon(
                          isActive ? activeIcon : icon,
                          key: ValueKey('${i}_$isActive'),
                          color: isActive ? activeColor : inactiveColor,
                          size: 24.sp,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      AnimatedDefaultTextStyle(
                        duration: const Duration(milliseconds: 200),
                        style: TextStyle(
                          fontFamily: GoogleFonts.inter().fontFamily,
                          fontSize: 10.sp,
                          fontWeight:
                              isActive ? FontWeight.w600 : FontWeight.w500,
                          color: isActive ? activeColor : inactiveColor,
                        ),
                        child: Text(label),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
