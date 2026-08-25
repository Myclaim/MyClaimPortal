import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen>
    with SingleTickerProviderStateMixin {
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
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            _buildTabBar(context),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _ClientDocumentsTab(),
                  _CompanyDocumentsTab(),
                  _LegalDocumentsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20.w, 20.h, 20.w, 0),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Documents',
                  style: GoogleFonts.inter(
                      fontSize: 26.sp,
                      fontWeight: FontWeight.w800,
                      color: context.textColor)),
              Text('Manage all your claim documents',
                  style: GoogleFonts.inter(
                      fontSize: 13.sp, color: context.textSecondaryColor)),
            ],
          ),
          const Spacer(),
          Container(
            padding: EdgeInsets.all(10.r),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
            ),
            child: Icon(Icons.folder_outlined, color: AppColors.primary, size: 22.sp),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: Container(
        height: 44.h,
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: context.borderColor),
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(10.r),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelColor: Colors.white,
          unselectedLabelColor: context.textSecondaryColor,
          labelStyle: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w600),
          unselectedLabelStyle: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w500),
          padding: EdgeInsets.all(3.r),
          tabs: const [
            Tab(text: 'My Docs'),
            Tab(text: 'Company'),
            Tab(text: 'Legal'),
          ],
        ),
      ),
    );
  }
}

// ─── TAB 1: Client Documents ───────────────────────────────────
class _ClientDocumentsTab extends StatefulWidget {
  const _ClientDocumentsTab();

  @override
  State<_ClientDocumentsTab> createState() => _ClientDocumentsTabState();
}

class _ClientDocumentsTabState extends State<_ClientDocumentsTab> {
  bool _isLoading = true;
  List<dynamic> _documents = [];
  Map<String, dynamic>? _profile;
  String? _selectedFolder;

  final List<Map<String, dynamic>> _kycDocs = [
    {'name': 'PAN Card', 'icon': Icons.credit_card_rounded, 'key': 'panCardFile'},
    {'name': 'Aadhaar Card', 'icon': Icons.fingerprint_rounded, 'key': 'aadharCardFile'},
    {'name': 'Passport', 'icon': Icons.book_rounded, 'key': 'passportFile'},
    {'name': 'Driving Licence', 'icon': Icons.drive_eta_rounded, 'key': 'drivingLicenceFile'},
    {'name': 'Other Docs', 'icon': Icons.attach_file_rounded, 'key': 'otherDocsFile'},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final docs = await ApiService.getDocuments();
    final profileResp = await ApiService.getClientProfile();
    if (mounted) {
      setState(() {
        _documents = docs;
        _profile = profileResp?['data'] ?? profileResp;
        _isLoading = false;
      });
    }
  }

  List<String> get _folders {
    final custom = (_profile?['customFolders'] as List?)?.cast<String>() ?? [];
    final fromDocs = _documents
        .map((d) => d['folder']?.toString() ?? 'General')
        .where((f) => f != 'General')
        .toSet()
        .toList();
    final all = {...custom, ...fromDocs}.toList();
    if (all.isEmpty) all.add('Client Registration Form');
    return all;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.symmetric(horizontal: 20.w),
        children: [
          _SectionHeader(title: 'KYC Documents', subtitle: 'Identity verification files'),
          SizedBox(height: 12.h),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12.w,
              mainAxisSpacing: 12.h,
              childAspectRatio: 1.5,
            ),
            itemCount: _kycDocs.length,
            itemBuilder: (context, i) {
              final doc = _kycDocs[i];
              final key = doc['key'] as String;
              final kycData = _profile?['kyc_data'] as Map?;
              final fileUrl = kycData?[key] as String?;
              final isUploaded = fileUrl != null && fileUrl.isNotEmpty;
              return _KycDocCard(
                name: doc['name'] as String,
                icon: doc['icon'] as IconData,
                isUploaded: isUploaded,
                url: fileUrl,
              );
            },
          ),
          SizedBox(height: 28.h),
          _SectionHeader(title: 'Form Folders', subtitle: 'Documents organized by submission'),
          SizedBox(height: 12.h),
          if (_selectedFolder == null)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12.w,
                mainAxisSpacing: 12.h,
                childAspectRatio: 1.4,
              ),
              itemCount: _folders.length,
              itemBuilder: (context, i) {
                final folderName = _folders[i];
                final count = _documents
                    .where((d) => (d['folder'] ?? 'General') == folderName)
                    .length;
                return _FolderCard(
                  name: folderName,
                  docCount: count,
                  onTap: () => setState(() => _selectedFolder = folderName),
                );
              },
            )
          else
            _FolderDetailView(
              folderName: _selectedFolder!,
              documents: _documents
                  .where((d) => (d['folder'] ?? 'General') == _selectedFolder)
                  .toList(),
              onBack: () => setState(() => _selectedFolder = null),
            ),
          SizedBox(height: 100.h),
        ],
      ),
    );
  }
}

// ─── TAB 2: Company Documents ──────────────────────────────────
class _CompanyDocumentsTab extends StatefulWidget {
  const _CompanyDocumentsTab();
  @override
  State<_CompanyDocumentsTab> createState() => _CompanyDocumentsTabState();
}

class _CompanyDocumentsTabState extends State<_CompanyDocumentsTab> {
  bool _isLoading = true;
  List<dynamic> _docs = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await ApiService.getCompanyDocuments();
    if (mounted) setState(() { _docs = data; _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Center(child: CircularProgressIndicator(color: AppColors.primary));
    if (_docs.isEmpty) return const _EmptyDocState(label: 'No company documents yet', sub: 'Documents shared by your case manager will appear here.');
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _load,
      child: ListView.builder(
        padding: EdgeInsets.fromLTRB(20.w, 0, 20.w, 100.h),
        itemCount: _docs.length,
        itemBuilder: (context, i) => _DocumentTile(doc: _docs[i]),
      ),
    );
  }
}

// ─── TAB 3: Legal Documents ───────────────────────────────────
class _LegalDocumentsTab extends StatefulWidget {
  const _LegalDocumentsTab();
  @override
  State<_LegalDocumentsTab> createState() => _LegalDocumentsTabState();
}

class _LegalDocumentsTabState extends State<_LegalDocumentsTab> {
  bool _isLoading = true;
  List<dynamic> _docs = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await ApiService.getLegalDocuments();
    if (mounted) setState(() { _docs = data; _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Center(child: CircularProgressIndicator(color: AppColors.primary));
    if (_docs.isEmpty) return const _EmptyDocState(label: 'No legal documents yet', sub: 'Legal filings and notices shared with you will appear here.');
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _load,
      child: ListView.builder(
        padding: EdgeInsets.fromLTRB(20.w, 0, 20.w, 100.h),
        itemCount: _docs.length,
        itemBuilder: (context, i) => _DocumentTile(doc: _docs[i]),
      ),
    );
  }
}

// ─── REUSABLE WIDGETS ─────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  const _SectionHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor)),
      Text(subtitle, style: GoogleFonts.inter(fontSize: 12.sp, color: context.textSecondaryColor)),
    ]);
  }
}

class _KycDocCard extends StatelessWidget {
  final String name;
  final IconData icon;
  final bool isUploaded;
  final String? url;
  const _KycDocCard({required this.name, required this.icon, required this.isUploaded, this.url});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        if (isUploaded && url != null) {
          final fullUrl = url!.startsWith('http') ? url! : 'https://myclaimportal.onrender.com\$url';
          await launchUrl(Uri.parse(fullUrl), mode: LaunchMode.externalApplication);
        }
      },
      child: Container(
        padding: EdgeInsets.all(14.r),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: isUploaded ? AppColors.primary.withValues(alpha: 0.4) : context.borderColor),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(icon, color: AppColors.primary, size: 22.sp),
            const Spacer(),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
              decoration: BoxDecoration(
                color: isUploaded ? AppColors.primary.withValues(alpha: 0.1) : Colors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6.r),
              ),
              child: Text(
                isUploaded ? 'Done' : 'Pending',
                style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.w700, color: isUploaded ? AppColors.primary : Colors.orange),
              ),
            ),
          ]),
          const Spacer(),
          Text(name, style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600, color: context.textColor)),
        ]),
      ),
    ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.95, 0.95));
  }
}

class _FolderCard extends StatelessWidget {
  final String name;
  final int docCount;
  final VoidCallback onTap;
  const _FolderCard({required this.name, required this.docCount, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16.r),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: context.borderColor),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(Icons.folder_rounded, color: AppColors.primary, size: 28.sp),
          const Spacer(),
          Text(name, style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600, color: context.textColor), maxLines: 1, overflow: TextOverflow.ellipsis),
          SizedBox(height: 2.h),
          Text('$docCount file${docCount == 1 ? '' : 's'}', style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
        ]),
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05);
  }
}

class _FolderDetailView extends StatelessWidget {
  final String folderName;
  final List<dynamic> documents;
  final VoidCallback onBack;
  const _FolderDetailView({required this.folderName, required this.documents, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Row(children: [
        GestureDetector(
          onTap: onBack,
          child: Container(
            padding: EdgeInsets.all(8.r),
            decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(10.r), border: Border.all(color: context.borderColor)),
            child: Icon(Icons.arrow_back_rounded, color: context.textColor, size: 18.sp),
          ),
        ),
        SizedBox(width: 12.w),
        Expanded(child: Text(folderName, style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.bold, color: context.textColor), overflow: TextOverflow.ellipsis)),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8.r)),
          child: Text('${documents.length} files', style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ),
      ]),
      SizedBox(height: 16.h),
      if (documents.isEmpty)
        _EmptyDocState(label: 'Folder is empty', sub: 'No documents in "$folderName".')
      else
        ...documents.map((doc) => _DocumentTile(doc: doc)),
    ]);
  }
}

class _DocumentTile extends StatelessWidget {
  final dynamic doc;
  const _DocumentTile({required this.doc});

  IconData _iconForType(String type) {
    switch (type.toLowerCase()) {
      case 'pdf': return Icons.picture_as_pdf_rounded;
      case 'jpg': case 'jpeg': case 'png': return Icons.image_rounded;
      case 'doc': case 'docx': return Icons.description_rounded;
      default: return Icons.insert_drive_file_rounded;
    }
  }

  Color _colorForStatus(String status) {
    switch (status.toLowerCase()) {
      case 'verified': return AppColors.primary;
      case 'rejected': return Colors.red;
      default: return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = doc['name']?.toString() ?? 'Document';
    final type = doc['file_type']?.toString() ?? 'file';
    final rawUrl = doc['file_url']?.toString() ?? '';
    final url = rawUrl.startsWith('http') ? rawUrl : 'https://myclaimportal.onrender.com$rawUrl';
    final status = doc['verification_status']?.toString() ?? 'pending';

    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16.r), border: Border.all(color: context.borderColor)),
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        leading: Container(
          width: 46.w, height: 46.w,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12.r)),
          child: Icon(_iconForType(type), color: AppColors.primary, size: 22.sp),
        ),
        title: Text(title, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: context.textColor), maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Row(children: [
          Text(type.toUpperCase(), style: GoogleFonts.inter(fontSize: 10.sp, color: context.textSecondaryColor)),
          SizedBox(width: 8.w),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.h),
            decoration: BoxDecoration(color: _colorForStatus(status).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6.r)),
            child: Text(status[0].toUpperCase() + status.substring(1), style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.w700, color: _colorForStatus(status))),
          ),
        ]),
        trailing: url.isNotEmpty
            ? IconButton(
                icon: Icon(Icons.open_in_new_rounded, color: AppColors.primary, size: 20.sp),
                onPressed: () async => await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication),
              )
            : null,
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05);
  }
}

class _EmptyDocState extends StatelessWidget {
  final String label;
  final String sub;
  const _EmptyDocState({required this.label, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(40.r),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.folder_open_rounded, size: 72.sp, color: AppColors.primary.withValues(alpha: 0.3)),
          SizedBox(height: 16.h),
          Text(label, style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor)),
          SizedBox(height: 8.h),
          Text(sub, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 13.sp, color: context.textSecondaryColor)),
        ]),
      ),
    );
  }
}
