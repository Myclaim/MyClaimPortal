import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../providers/family_tree_provider.dart';
import '../../../utils/theme.dart';
import '../../../utils/constants.dart';

class FamilyTreeScreen extends StatefulWidget {
  const FamilyTreeScreen({super.key});

  @override
  State<FamilyTreeScreen> createState() => _FamilyTreeScreenState();
}

class _FamilyTreeScreenState extends State<FamilyTreeScreen> {
  void _addFamilyMember() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AddMemberSheet(
        onAdd: (name, relation) {
          context.read<FamilyTreeProvider>().addMember(name: name, relation: relation);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final familyTree = context.watch<FamilyTreeProvider>();
    final _familyMembers = familyTree.members;
    return Scaffold(
      backgroundColor: context.surfaceColor,
      appBar: AppBar(
        title: Text('Family Tree', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: context.surfaceColor,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: _addFamilyMember,
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Family Tree & Hierarchy',
              style: GoogleFonts.poppins(
                fontSize: 24.sp,
                fontWeight: FontWeight.w800,
                color: context.textColor,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Build your family tree to help establish relationships for complex inheritance and transmission claims.',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: context.textSecondaryColor,
              ),
            ),
            SizedBox(height: 32.h),

            // Family Tree Visualizer
            Center(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: FamilyTreeView(members: _familyMembers),
              ),
            ),

            SizedBox(height: 32.h),
            
            SizedBox(
              width: double.infinity,
              height: 56.h,
              child: OutlinedButton.icon(
                onPressed: _addFamilyMember,
                icon: const Icon(Icons.add),
                label: Text(
                  'Add Family Member',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary, side: BorderSide(color: AppColors.primary),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FamilyTreeView extends StatelessWidget {
  final List<FamilyMember> members;
  const FamilyTreeView({super.key, required this.members});

  @override
  Widget build(BuildContext context) {
    final ancestors = members.where((m) => ['Father', 'Mother', 'Grandfather', 'Grandmother'].contains(m.relation)).toList();
    final siblings = members.where((m) => ['Brother', 'Sister'].contains(m.relation)).toList();
    final children = members.where((m) => ['Son', 'Daughter'].contains(m.relation)).toList();
    final spouse = members.where((m) => ['Spouse'].contains(m.relation)).toList();
    final others = members.where((m) => !['Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse', 'Primary Client'].contains(m.relation)).toList();
    final client = members.firstWhere((m) => m.isPrimary, orElse: () => FamilyMember(id: '0', name: 'Client', relation: 'Primary Client', email: '', isPrimary: true));

    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.h, horizontal: 20.w),
      decoration: BoxDecoration(
        color: context.isDark ? const Color(0xFF1A1F2E) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          // Ancestors
          if (ancestors.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: ancestors.map((m) => Padding(
                padding: EdgeInsets.symmetric(horizontal: 10.w),
                child: FamilyTreeNode(member: m),
              )).toList(),
            ),
            _VerticalLine(),
          ],

          // Client Level (Siblings, Client, Spouse)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (siblings.isNotEmpty) ...[
                Row(
                  children: siblings.map((m) => Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10.w),
                    child: FamilyTreeNode(member: m),
                  )).toList(),
                ),
                _HorizontalLine(),
              ],
              
              FamilyTreeNode(member: client),
              
              if (spouse.isNotEmpty) ...[
                _HorizontalLine(),
                Row(
                  children: spouse.map((m) => Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10.w),
                    child: FamilyTreeNode(member: m),
                  )).toList(),
                ),
              ],
            ],
          ),

          // Children
          if (children.isNotEmpty) ...[
            _VerticalLine(),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: children.map((m) => Padding(
                padding: EdgeInsets.symmetric(horizontal: 10.w),
                child: FamilyTreeNode(member: m),
              )).toList(),
            ),
          ],

          // Others
          if (others.isNotEmpty) ...[
            SizedBox(height: 40.h),
            Container(height: 1, width: 200.w, color: context.borderColor),
            SizedBox(height: 20.h),
            Text('OTHER RELATIVES', style: GoogleFonts.poppins(fontSize: 10.sp, fontWeight: FontWeight.w800, color: context.textSecondaryColor, letterSpacing: 1.5)),
            SizedBox(height: 16.h),
            Wrap(
              spacing: 16.w,
              runSpacing: 16.h,
              alignment: WrapAlignment.center,
              children: others.map((m) => FamilyTreeNode(member: m)).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class FamilyTreeNode extends StatelessWidget {
  final FamilyMember member;
  const FamilyTreeNode({super.key, required this.member});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () {
        if (!member.isPrimary) {
          context.read<FamilyTreeProvider>().removeMember(member.id);
        }
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        constraints: BoxConstraints(minWidth: 100.w),
        decoration: BoxDecoration(
          color: member.isPrimary ? AppColors.primary : (context.isDark ? AppColors.surface : Colors.white),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: member.isPrimary ? AppColors.primaryDark : context.borderColor,
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 6,
              offset: const Offset(0, 3),
            )
          ],
        ),
        child: Column(
          children: [
            Text(
              member.name,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 13.sp,
                fontWeight: FontWeight.w800,
                color: member.isPrimary ? Colors.white : context.textColor,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              member.isPrimary ? 'PRIMARY CLIENT' : member.relation.toUpperCase(),
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 9.sp,
                fontWeight: FontWeight.w800,
                color: member.isPrimary ? Colors.white.withValues(alpha: 0.8) : context.textSecondaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerticalLine extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 2,
      height: 24.h,
      color: context.isDark ? Colors.white.withValues(alpha: 0.2) : const Color(0xFFCBD5E1),
    );
  }
}

class _HorizontalLine extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24.w,
      height: 2,
      color: context.isDark ? Colors.white.withValues(alpha: 0.2) : const Color(0xFFCBD5E1),
    );
  }
}

class _AddMemberSheet extends StatefulWidget {
  final Function(String name, String relation) onAdd;

  const _AddMemberSheet({required this.onAdd});

  @override
  State<_AddMemberSheet> createState() => _AddMemberSheetState();
}

class _AddMemberSheetState extends State<_AddMemberSheet> {
  final _nameController = TextEditingController();
  String _selectedRelation = 'Father';
  final _relations = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'];

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24.h,
        left: 24.w, right: 24.w, top: 24.h,
      ),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32.r)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Add Member', style: GoogleFonts.poppins(fontSize: 20.sp, fontWeight: FontWeight.bold, color: context.textColor)),
          SizedBox(height: 24.h),
          
          Text('Full Name', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13.sp)),
          SizedBox(height: 8.h),
          TextField(
            controller: _nameController,
            decoration: InputDecoration(
              hintText: 'Enter full name',
              filled: true,
              fillColor: context.isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16.r), borderSide: BorderSide(color: context.borderColor)),
            ),
          ),
          
          SizedBox(height: 16.h),
          Text('Relation to you', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13.sp)),
          SizedBox(height: 8.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            decoration: BoxDecoration(
              color: context.isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: context.borderColor),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedRelation,
                isExpanded: true,
                dropdownColor: context.surfaceColor,
                items: _relations.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedRelation = val);
                },
              ),
            ),
          ),

          SizedBox(height: 32.h),
          SizedBox(
            width: double.infinity,
            height: 56.h,
            child: ElevatedButton(
              onPressed: () {
                if (_nameController.text.trim().isNotEmpty) {
                  widget.onAdd(_nameController.text.trim(), _selectedRelation);
                  Navigator.pop(context);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
              ),
              child: Text('Save Member', style: GoogleFonts.poppins(fontSize: 16.sp, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
