import sys

with open('lib/screens/main_shell.dart', 'r') as f:
    shell = f.read()

# Replace _screens with late final
shell = shell.replace('''  final List<Widget> _screens = [
    const HomeScreen(),''', '''  late final List<Widget> _screens = [
    HomeScreen(onNavigate: _onNavigate),''')

shell = shell.replace('''  @override
  void initState() {''', '''  void _onNavigate(int index) {
    setState(() => _currentIndex = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 600),
      curve: Curves.fastOutSlowIn,
    );
  }

  @override
  void initState() {''')

shell = shell.replace('''        onTap: (i) {
          setState(() => _currentIndex = i);
          _pageController.animateToPage(
            i,
            duration: const Duration(milliseconds: 600),
            curve: Curves.fastOutSlowIn,
          );
        },''', '''        onTap: _onNavigate,''')

with open('lib/screens/main_shell.dart', 'w') as f:
    f.write(shell)

with open('lib/screens/home_screen.dart', 'r') as f:
    home = f.read()

home = home.replace('''class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});''', '''class HomeScreen extends StatefulWidget {
  final ValueChanged<int>? onNavigate;
  const HomeScreen({super.key, this.onNavigate});''')

# Welcome text color:
home = home.replace("color: Colors.white, height: 1.2),", "color: AppColors.primary, height: 1.2),")

# 'More' button to use GestureDetector
old_more = '''              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'More',
                    style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  SizedBox(width: 4.w),
                  Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary, size: 18.sp),
                ],
              ),'''

new_more = '''              GestureDetector(
                onTap: () {
                  if (widget.onNavigate != null) {
                    widget.onNavigate!(1); // 1 is Claims tab
                  }
                },
                behavior: HitTestBehavior.opaque,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'More',
                      style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                    SizedBox(width: 4.w),
                    Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary, size: 18.sp),
                  ],
                ),
              ),'''
home = home.replace(old_more, new_more)

with open('lib/screens/home_screen.dart', 'w') as f:
    f.write(home)

