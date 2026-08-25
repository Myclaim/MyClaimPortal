import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/biometric_provider.dart';
import '../providers/family_tree_provider.dart';
import '../utils/constants.dart';
import '../services/api_service.dart';
import '../services/biometric_service.dart';
import 'folder_documents_screen.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthProvider>().refreshProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    final sections = [
      {
        'title': 'Account',
        'items': [
          {'icon': Icons.person_rounded, 'label': 'Personal Information', 'color': AppColors.blue, 'sub': 'Name, Email, Phone'},
          {'icon': Icons.family_restroom_rounded, 'label': 'Family Members', 'color': AppColors.accent, 'sub': 'Manage dependents'},
          {'icon': Icons.lock_rounded, 'label': 'Change Password', 'color': AppColors.purple, 'sub': 'Update credentials'},
        ],
      },
      {
        'title': 'Documents & Activity',
        'items': [
          {'icon': Icons.folder_rounded, 'label': 'My Documents', 'color': AppColors.warning, 'sub': 'KYC, PAN, Cheques'},
          {'icon': Icons.history_rounded, 'label': 'Activity Log', 'color': AppColors.blue, 'sub': 'View all actions'},
          {'icon': Icons.receipt_rounded, 'label': 'Claim History', 'color': AppColors.accent, 'sub': 'All past claims'},
        ],
      },
      {
        'title': 'Support',
        'items': [
          {'icon': Icons.headset_mic_rounded, 'label': 'Contact Support', 'color': AppColors.purple, 'sub': 'Chat or call us'},
          {'icon': Icons.help_outline_rounded, 'label': 'FAQ', 'color': AppColors.warning, 'sub': 'Common questions'},
          {'icon': Icons.policy_rounded, 'label': 'Terms & Privacy', 'color': context.textSecondaryColor, 'sub': 'Legal documents'},
        ],
      },
    ];

    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: ListView(
        children: [
          // ── Gradient Profile Header ─────────────────
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF3D2C8D), Color(0xFF6C3BAA), Color(0xFF916BBF)],
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(20.w, 20.h, 20.w, 28.h),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 64, height: 64,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20.r),
                          ),
                          child: Center(
                            child: Text(
                              auth.userName.isNotEmpty ? auth.userName[0].toUpperCase() : 'C',
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 26.sp, fontWeight: FontWeight.w900),
                            ),
                          ),
                        ),
                        SizedBox(width: 16.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(auth.userName, style: GoogleFonts.poppins(fontSize: 18.sp, fontWeight: FontWeight.w800, color: Colors.white)),
                              SizedBox(height: 3.h),
                              Text(auth.userEmail, style: GoogleFonts.poppins(fontSize: 12.sp, color: Colors.white70)),
                              SizedBox(height: 8.h),
                              Container(
                                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(99.r),
                                ),
                                child: Text('CLIENT', style: GoogleFonts.poppins(fontSize: 9.sp, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.2)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: 20.h),
                    Container(height: 1, color: Colors.white.withValues(alpha: 0.2)),
                    SizedBox(height: 20.h),

                    // Quick stats
                    Row(children: [
                      _ProfileStat(label: 'Total Claims', value: '3'),
                      _vDivider(context),
                      _ProfileStat(label: 'In Progress', value: '2'),
                      _vDivider(context),
                      _ProfileStat(label: 'Recovered', value: '₹1.88L'),
                    ]),
                  ],
                ),
              ),
            ),
          ).animate().fade(duration: 500.ms),

            // ── Menu Sections ──────────────────────────
            ...sections.asMap().entries.map((sectionEntry) {
              final section = sectionEntry.value;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.fromLTRB(20, 16, 20, 10),
                    child: Text(
                      section['title'] as String,
                      style: GoogleFonts.poppins(
                        fontSize: 12.sp, fontWeight: FontWeight.w700,
                        color: context.textSecondaryColor, letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 16.w),
                    decoration: BoxDecoration(
                      color: context.isDark ? const Color(0xFF1A1F2E) : context.surfaceColor,
                      borderRadius: BorderRadius.circular(18.r),
                      border: Border.all(color: context.borderColor, width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: context.isDark ? 0.2 : 0.04),
                          blurRadius: 8, offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      children: (section['items'] as List<Map<String, dynamic>>).asMap().entries.map((itemEntry) {
                        final item = itemEntry.value;
                        final isLast = itemEntry.key == (section['items'] as List).length - 1;
                        final color = item['color'] as Color;

                        return GestureDetector(
                          onTap: () {
                            if (item['label'] == 'Personal Information') {
                              _showPersonalInfo(context, auth);
                            } else if (item['label'] == 'Family Members') {
                              _showFamilyMembers(context);
                            } else if (item['label'] == 'Change Password') {
                              _showChangePassword(context);
                            } else if (item['label'] == 'My Documents') {
                              _showDocuments(context, auth);
                            } else if (item['label'] == 'Recent Activity') {
                              _showActivity(context);
                            }
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              border: isLast ? null : Border(
                                bottom: BorderSide(color: context.borderColor, width: 1),
                              ),
                            ),
                            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
                            child: Row(children: [
                              Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(13.r),
                                ),
                                child: Icon(item['icon'] as IconData, color: color, size: 20.sp),
                              ),
                              SizedBox(width: 14.w),
                              Expanded(
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(
                                    item['label'] as String,
                                    style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor),
                                  ),
                                  SizedBox(height: 1.h),
                                  Text(
                                    item['sub'] as String,
                                    style: GoogleFonts.poppins(fontSize: 11.sp, color: context.textSecondaryColor),
                                  ),
                                ]),
                              ),
                              Icon(Icons.chevron_right_rounded, color: context.textSecondaryColor.withValues(alpha: 0.5), size: 20.sp),
                            ]),
                          ),
                        );
                      }).toList(),
                    ),
                  ).animate(delay: Duration(milliseconds: 100 + sectionEntry.key * 60)).fade().slideY(begin: 0.05),
                  SizedBox(height: 8.h),
                ],
              );
            }),

            // ── Security Section ──────────────────────────
            _BiometricToggleSection().animate(delay: 300.ms).fade().slideY(begin: 0.05),
            SizedBox(height: 8.h),

            // ── Sign Out ────────────────────────────────
            Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: GestureDetector(
                onTap: () => _confirmLogout(context, auth),
                child: Container(
                  padding: EdgeInsets.all(16.r),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(16.r),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.2), width: 1),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.logout_rounded, color: AppColors.error, size: 20.sp),
                      SizedBox(width: 14.w),
                      Text('Sign Out', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w700, color: AppColors.error)),
                      Spacer(),
                      Icon(Icons.chevron_right_rounded, color: AppColors.error, size: 18.sp),
                    ],
                  ),
                ),
              ),
            ).animate(delay: 350.ms).fade(),

            // App version
            Padding(
              padding: EdgeInsets.symmetric(vertical: 24.h),
              child: Center(child: Text('My Claim v1.0.0 · Client Portal', style: TextStyle(fontSize: 11.sp, color: context.textSecondaryColor))),
            ),
          ],
        ),
    );
  }

  void _showChangePassword(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => const _ChangePasswordSheet(),
    );
  }

  void _showDocuments(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _DocumentsSheet(user: auth.user),
    );
  }

  void _showActivity(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => const _ActivitySheet(),
    );
  }

  void _showPersonalInfo(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _PersonalInfoSheet(user: auth.user),
    );
  }

  void _showFamilyMembers(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (_) => const _FamilyMembersSheet(),
    );
  }




  Widget _buildFamilyMemberCard(String name, String relation, String email) {
    return Container(
      padding: EdgeInsets.all(12.r),
      decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12.r), border: Border.all(color: context.borderColor)),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10.r)),
            child: Icon(Icons.person_rounded, color: AppColors.accent, size: 18.sp),
          ),
          SizedBox(width: 12.w),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor)),
            Text('$relation • $email', style: TextStyle(fontSize: 11.sp, color: context.textSecondaryColor)),
          ])),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24.r))),
      builder: (sheetContext) => Padding(
        padding: EdgeInsets.all(24.r),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)))),
            SizedBox(height: 24.h),
            Container(width: 56, height: 56, decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.1), shape: BoxShape.circle), child: Icon(Icons.logout_rounded, color: AppColors.error, size: 26.sp)),
            SizedBox(height: 16.h),
            Text('Sign Out?', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            SizedBox(height: 8.h),
            Text('You will be logged out of your account.\nYou can log back in anytime.', style: TextStyle(fontSize: 13.sp, color: context.textSecondaryColor), textAlign: TextAlign.center),
            SizedBox(height: 24.h),
            Row(children: [
              Expanded(child: GestureDetector(
                onTap: () => Navigator.pop(sheetContext),
                child: Container(
                  height: 50, alignment: Alignment.center,
                  decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12.r), border: Border.all(color: context.borderColor)),
                  child: Text('Cancel', style: TextStyle(fontWeight: FontWeight.w700, color: context.textSecondaryColor, fontSize: 15.sp)),
                ),
              )),
              SizedBox(width: 12.w),
              Expanded(child: GestureDetector(
                onTap: () {
                  // Capture providers and navigator synchronously
                  final bioProvider = context.read<BiometricProvider>();
                  final navigator = Navigator.of(context, rootNavigator: true);
                  
                  // 1. Dismiss the bottom sheet immediately
                  Navigator.pop(sheetContext);
                  
                  // 2. Start background cleanup (fire and forget, do not await)
                  bioProvider.resetForNewUser();
                  auth.logout();
                  
                  // 3. Immediately route to LoginScreen in the same UI frame
                  navigator.pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                },
                child: Container(
                  height: 50, alignment: Alignment.center,
                  decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(12.r)),
                  child: Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 15.sp)),
                ),
              )),
            ]),
            SizedBox(height: 8.h),
          ],
        ),
      ),
    );
  }
}

class _FamilyMembersSheet extends StatelessWidget {
  const _FamilyMembersSheet();

  @override
  Widget build(BuildContext context) {
    final familyTree = context.watch<FamilyTreeProvider>();
    // Exclude the primary client to just show dependents in the profile summary
    final dependents = familyTree.members.where((m) => !m.isPrimary).toList();

    return Padding(
      padding: EdgeInsets.all(24.r),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)))),
          SizedBox(height: 24.h),
          Text('Family Members', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
          SizedBox(height: 12.h),
          if (dependents.isEmpty)
            Padding(
              padding: EdgeInsets.symmetric(vertical: 24.h),
              child: Text(
                'No family members added yet.\nGo to Quick Actions > Family Tree to add them.',
                style: TextStyle(fontSize: 14.sp, color: context.textSecondaryColor, height: 1.5),
                textAlign: TextAlign.center,
              ),
            )
          else
            ...dependents.map((m) => Padding(
              padding: EdgeInsets.only(bottom: 8.h),
              child: Container(
                padding: EdgeInsets.all(12.r),
                decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12.r), border: Border.all(color: context.borderColor)),
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10.r)),
                      child: Icon(Icons.person_rounded, color: AppColors.accent, size: 18.sp),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(m.name, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor)),
                      Text('${m.relation} • ${m.email}', style: TextStyle(fontSize: 11.sp, color: context.textSecondaryColor)),
                    ])),
                  ],
                ),
              ),
            )),
          SizedBox(height: 16.h),
        ],
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  final String label, value;
  const _ProfileStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(child: Column(children: [
      Text(
        value,
        style: GoogleFonts.poppins(fontSize: 18.sp, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.3),
      ),
      SizedBox(height: 3.h),
      Text(
        label,
        style: GoogleFonts.poppins(fontSize: 10.sp, color: Colors.white70, fontWeight: FontWeight.w600),
        textAlign: TextAlign.center,
      ),
    ]));
  }
}

Widget _vDivider(BuildContext context) => Container(width: 1, height: 36, color: Colors.white.withValues(alpha: 0.25));

class _PersonalInfoSheet extends StatelessWidget {
  final Map<String, dynamic>? user;
  const _PersonalInfoSheet({required this.user});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9, minChildSize: 0.5, maxChildSize: 0.95,
      builder: (_, scrollController) => Container(
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        ),
        child: Column(
          children: [
            SizedBox(height: 16.h),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r))),
            SizedBox(height: 16.h),
            Text('Client Profile', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            SizedBox(height: 16.h),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                children: [
                  _buildSection(context, '1. Login Credentials', [
                    _buildDetail('Client Code / ID', user?['client_id_ref']?.toString() ?? '—', isHighlight: true),
                    _buildDetail('Username', user?['username']?.toString() ?? '—'),
                    _buildDetail('Email (Login)', user?['email']?.toString() ?? '—'),
                    _buildDetail('Phone', user?['phone']?.toString() ?? '—'),
                  ]),
                  _buildSection(context, '2. Personal Info', [
                    _buildDetail('Name', user?['name']?.toString() ?? '—'),
                    _buildDetail('Date of Birth', user?['dob']?.toString() ?? '—'),
                    _buildDetail('Gender', user?['gender']?.toString() ?? '—'),
                    _buildDetail('Marital Status', user?['maritalStatus']?.toString() ?? '—'),
                    _buildDetail('Old Name', user?['oldName']?.toString() ?? '—'),
                    _buildDetail('New Name', user?['newName']?.toString() ?? '—'),
                    _buildDetail('Citizenship', user?['citizenship']?.toString() ?? '—'),
                    _buildDetail('Father/Spouse', user?['fatherSpouse']?.toString() ?? '—'),
                  ]),
                  _buildSection(context, '3. Contact Info', [
                    _buildDetail('Permanent Address', user?['permanentAddress']?.toString() ?? '—', fullWidth: true),
                    _buildDetail('Correspondence', user?['city'] != null ? '${user!['city']}, ${user!['state'] ?? ''}' : 'Same as Permanent', fullWidth: true),
                    _buildDetail('Old Address', user?['oldAddress']?.toString() ?? '—', fullWidth: true),
                  ]),
                  _buildSection(context, '4. Identification Details', [
                    _buildDetail('Aadhaar No.', user?['kyc_data']?['aadhaar']?.toString() ?? '—'),
                    _buildDetail('PAN No.', user?['kyc_data']?['pan']?.toString() ?? '—'),
                  ]),
                  _buildSection(context, '5. Relationship Details', [
                    _buildDetail('Relation to Shareholder', user?['relationWithHolder']?.toString() ?? '—'),
                    _buildDetail('Reference Type', user?['reference']?.toString() ?? '—'),
                  ]),
                  _buildSection(context, '6. Nominee Details', [
                    _buildDetail('Nominee Name', user?['nomineeName']?.toString() ?? '—'),
                    _buildDetail('Nominee Relation', user?['nomineeRelation']?.toString() ?? '—'),
                    _buildDetail('Nominee DOB', user?['nomineeDob']?.toString() ?? '—'),
                  ]),
                  SizedBox(height: 32.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, List<Widget> children) {
    return Container(
      margin: EdgeInsets.only(bottom: 24),
      padding: EdgeInsets.all(20.r),
      decoration: BoxDecoration(
        color: context.backgroundColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: context.textColor, letterSpacing: -0.3)),
          SizedBox(height: 16.h),
          Wrap(
            spacing: 16, runSpacing: 16,
            children: children,
          ),
        ],
      ),
    );
  }

  Widget _buildDetail(String label, String value, {bool isHighlight = false, bool fullWidth = false}) {
    return LayoutBuilder(builder: (context, constraints) {
      final width = fullWidth ? constraints.maxWidth : (constraints.maxWidth - 16) / 2;
      return SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 11.sp, color: context.textSecondaryColor, fontWeight: FontWeight.w600)),
            SizedBox(height: 4.h),
            Text(
              value.isEmpty ? '—' : value,
              style: TextStyle(
                fontSize: 13.sp,
                fontWeight: isHighlight ? FontWeight.w900 : FontWeight.w700,
                color: isHighlight ? AppColors.accent : context.textColor,
              ),
            ),
          ],
        ),
      );
    });
  }
}

class _ChangePasswordSheet extends StatefulWidget {
  const _ChangePasswordSheet();
  @override
  State<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends State<_ChangePasswordSheet> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  void _submit() async {
    if (_newController.text != _confirmController.text) {
      setState(() => _error = "New passwords don't match");
      return;
    }
    if (_newController.text.length < 6) {
      setState(() => _error = "Password must be at least 6 characters");
      return;
    }
    
    setState(() { _isLoading = true; _error = null; });
    final res = await ApiService.updateClientPassword(_currentController.text, _newController.text);
    setState(() => _isLoading = false);
    
    if (res['success'] == true) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Password updated successfully!')));
      }
    } else {
      setState(() => _error = res['message']);
    }
  }

  Widget _buildInput(String hint, IconData icon, TextEditingController controller) {
    return Container(
      decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(12.r), border: Border.all(color: context.borderColor)),
      child: TextField(
        controller: controller,
        obscureText: true,
        style: TextStyle(color: context.textColor, fontSize: 14.sp),
        decoration: InputDecoration(
          hintText: hint, hintStyle: TextStyle(color: context.textSecondaryColor),
          prefixIcon: Icon(icon, color: context.textSecondaryColor, size: 18.sp),
          border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Padding(
        padding: EdgeInsets.all(24.r),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r)))),
            SizedBox(height: 24.h),
            Text('Change Password', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            SizedBox(height: 20.h),
            if (_error != null) ...[
              Text(_error!, style: TextStyle(color: AppColors.error, fontSize: 13.sp, fontWeight: FontWeight.w600)),
              SizedBox(height: 12.h),
            ],
            _buildInput('Current Password', Icons.lock_outline, _currentController),
            SizedBox(height: 16.h),
            _buildInput('New Password', Icons.lock_outline, _newController),
            SizedBox(height: 16.h),
            _buildInput('Confirm New Password', Icons.lock_outline, _confirmController),
            SizedBox(height: 24.h),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent, padding: EdgeInsets.symmetric(vertical: 16.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r))),
              child: _isLoading 
                ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text('Update Password', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

class _DocumentsSheet extends StatelessWidget {
  final Map<String, dynamic>? user;
  const _DocumentsSheet({required this.user});

  @override
  Widget build(BuildContext context) {
    final kyc = user?['kyc_data'] as Map<String, dynamic>?;
    final hasAadhaar = kyc?['aadhaar'] != null && kyc!['aadhaar'].toString().isNotEmpty;
    final hasPan = kyc?['pan'] != null && kyc!['pan'].toString().isNotEmpty;

    return DraggableScrollableSheet(
      initialChildSize: 0.7, minChildSize: 0.4, maxChildSize: 0.9,
      builder: (_, scrollController) => Container(
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        ),
        child: Column(
          children: [
            SizedBox(height: 16.h),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r))),
            SizedBox(height: 16.h),
            Text('My Documents', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            SizedBox(height: 16.h),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: EdgeInsets.symmetric(horizontal: 0.w, vertical: 8.h),
                children: [
                  Padding(
                    padding: EdgeInsets.only(left: 20, bottom: 16),
                    child: Text('Document Folders', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: context.textSecondaryColor)),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    child: Column(
                      children: [
                        _buildFolderItem(context, 'Admin Uploads', AppColors.accent),
                        SizedBox(height: 12.h),
                        _buildFolderItem(context, 'Client Documents', AppColors.blue),
                        SizedBox(height: 12.h),
                        _buildFolderItem(context, 'Legal Documents', AppColors.error),
                      ],
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.only(left: 20, top: 16, bottom: 12),
                    child: Text('KYC Documents', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w800, color: context.textSecondaryColor)),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    child: _buildDocCard(context, 'Aadhaar Card', hasAadhaar ? kyc['aadhaar'].toString() : 'Not Provided', Icons.badge_rounded, hasAadhaar ? AppColors.accent : context.textSecondaryColor),
                  ),
                  SizedBox(height: 12.h),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    child: _buildDocCard(context, 'PAN Card', hasPan ? kyc['pan'].toString() : 'Not Provided', Icons.credit_card_rounded, hasPan ? AppColors.accent : context.textSecondaryColor),
                  ),
                  SizedBox(height: 24.h),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    child: Container(
                      padding: EdgeInsets.all(16.r),
                      decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12.r), border: Border.all(color: AppColors.warning.withValues(alpha: 0.2))),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline_rounded, color: AppColors.warning, size: 20.sp),
                          SizedBox(width: 12.w),
                          Expanded(child: Text('Document files can be managed by your administrator from the web portal.', style: TextStyle(fontSize: 12.sp, color: AppColors.warning))),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDocCard(BuildContext context, String title, String value, IconData icon, Color statusColor) {
    return Container(
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(color: context.backgroundColor, borderRadius: BorderRadius.circular(16.r), border: Border.all(color: context.borderColor)),
      child: Row(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12.r)),
            child: Icon(icon, color: statusColor, size: 20.sp),
          ),
          SizedBox(width: 16.w),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor)),
              SizedBox(height: 4.h),
              Text(value, style: TextStyle(fontSize: 12.sp, color: context.textSecondaryColor)),
            ],
          )),
        ],
      ),
    );
  }

  Widget _buildFolderItem(BuildContext context, String title, Color baseColor) {
    return InkWell(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => FolderDocumentsScreen(folderName: title)));
      },
      borderRadius: BorderRadius.circular(16.r),
      child: Container(
        padding: EdgeInsets.all(16.r),
        decoration: BoxDecoration(
          color: baseColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: baseColor.withValues(alpha: 0.2)),
        ),
        child: Row(
          children: [
            Icon(Icons.folder_rounded, color: baseColor, size: 28.sp),
            SizedBox(width: 16.w),
            Expanded(
              child: Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w700, color: context.textColor)),
            ),
            Icon(Icons.chevron_right_rounded, color: baseColor.withValues(alpha: 0.5), size: 24.sp),
          ],
        ),
      ),
    );
  }
}

class _ActivitySheet extends StatelessWidget {
  const _ActivitySheet();

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6, minChildSize: 0.4, maxChildSize: 0.9,
      builder: (_, scrollController) => Container(
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        ),
        child: Column(
          children: [
            SizedBox(height: 16.h),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(99.r))),
            SizedBox(height: 16.h),
            Text('Recent Activity', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w900, color: context.textColor)),
            SizedBox(height: 16.h),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                children: [
                  _buildLogItem(context, 'Successful Login', 'You logged into the mobile portal', 'Just now', Icons.login_rounded, AppColors.accent),
                  _buildLogItem(context, 'Profile Viewed', 'Accessed Personal Information', '2 mins ago', Icons.visibility_rounded, AppColors.blue),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogItem(BuildContext context, String title, String desc, String time, IconData icon, Color color) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36, height: 36, margin: EdgeInsets.only(top: 2),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 16.sp),
          ),
          SizedBox(width: 16.w),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor)),
              SizedBox(height: 2.h),
              Text(desc, style: TextStyle(fontSize: 12.sp, color: context.textSecondaryColor)),
              SizedBox(height: 4.h),
              Text(time, style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w600, color: color)),
            ],
          )),
        ],
      ),
    );
  }
}

// ── Biometric Toggle Section ─────────────────────────────────────
class _BiometricToggleSection extends StatefulWidget {
  const _BiometricToggleSection();

  @override
  State<_BiometricToggleSection> createState() => _BiometricToggleSectionState();
}

class _BiometricToggleSectionState extends State<_BiometricToggleSection> {
  bool _toggling = false;

  Future<void> _handleToggle(BuildContext context, BiometricProvider bio, bool newValue) async {
    if (_toggling) return;
    setState(() => _toggling = true);

    if (newValue) {
      // Confirm with biometrics before enabling
      final success = await BiometricService.authenticate(usePasscodeFallback: false);
      if (success) {
        await bio.enable();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Biometric login enabled!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
          ));
        }
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Authentication failed. Biometric not enabled.'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
          ));
        }
      }
    } else {
      await bio.disable();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Biometric login disabled.'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
        ));
      }
    }

    setState(() => _toggling = false);
  }

  @override
  Widget build(BuildContext context) {
    final bio = context.watch<BiometricProvider>();

    if (!bio.isAvailable) return const SizedBox.shrink(); // Hide if device has no biometrics

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(20, 16, 20, 10),
          child: Text(
            'SECURITY',
            style: GoogleFonts.poppins(
              fontSize: 12.sp, fontWeight: FontWeight.w700,
              color: context.textSecondaryColor, letterSpacing: 0.5,
            ),
          ),
        ),
        Container(
          margin: EdgeInsets.symmetric(horizontal: 16.w),
          decoration: BoxDecoration(
            color: context.isDark ? const Color(0xFF1A1F2E) : context.surfaceColor,
            borderRadius: BorderRadius.circular(18.r),
            border: Border.all(color: context.borderColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: context.isDark ? 0.2 : 0.04),
                blurRadius: 8, offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(13.r),
                  ),
                  child: Icon(Icons.fingerprint, color: AppColors.primary, size: 22.sp),
                ),
                SizedBox(width: 14.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Biometric Login',
                        style: GoogleFonts.poppins(fontSize: 14.sp, fontWeight: FontWeight.w700, color: context.textColor),
                      ),
                      SizedBox(height: 1.h),
                      Text(
                        bio.isEnabled ? 'Fingerprint / Face ID active' : 'Tap to enable fingerprint or face ID',
                        style: GoogleFonts.poppins(fontSize: 11.sp, color: context.textSecondaryColor),
                      ),
                    ],
                  ),
                ),
                _toggling
                    ? SizedBox(
                        width: 24.w, height: 24.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(AppColors.primary),
                        ),
                      )
                    : Switch(
                        value: bio.isEnabled,
                        activeColor: AppColors.primary,
                        onChanged: (val) => _handleToggle(context, bio, val),
                      ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
