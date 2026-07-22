import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class FolderDocumentsScreen extends StatefulWidget {
  final String folderName;

  const FolderDocumentsScreen({super.key, required this.folderName});

  @override
  State<FolderDocumentsScreen> createState() => _FolderDocumentsScreenState();
}

class _FolderDocumentsScreenState extends State<FolderDocumentsScreen> {
  bool _isLoading = true;
  List<dynamic> _documents = [];

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    final docs = await ApiService.getDocuments();
    if (mounted) {
      setState(() {
        // Filter documents by the selected folder.
        // We'll handle exact string matching or fallback to showing all if we want to be safe,
        // but the web app uses these exact folder names.
        _documents = docs.where((d) => d['folder'] == widget.folderName).toList();
        _isLoading = false;
      });
    }
  }

  Future<void> _openDocument(String url) async {
    if (url.isEmpty) return;
    final uri = Uri.parse(url);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not open document')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(widget.folderName, style: TextStyle(fontWeight: FontWeight.w800)),
        centerTitle: true,
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _documents.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: EdgeInsets.all(20.r),
                  itemCount: _documents.length,
                  itemBuilder: (context, index) {
                    final doc = _documents[index];
                    return _buildDocumentTile(doc);
                  },
                ),
    );
  }

  Widget _buildDocumentTile(Map<String, dynamic> doc) {
    final title = doc['name'] ?? 'Unknown Document';
    final type = doc['file_type'] ?? '';
    final url = doc['file_url'] ?? '';
    
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        leading: Container(
          width: 48, height: 48,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12.r)),
          child: Icon(Icons.description_rounded, color: AppColors.primary),
        ),
        title: Text(title, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15.sp)),
        subtitle: Text(type.toString().toUpperCase(), style: TextStyle(color: AppColors.textSecondary, fontSize: 12.sp)),
        trailing: Icon(Icons.open_in_new_rounded, color: AppColors.textSecondary, size: 20.sp),
        onTap: () => _openDocument(url),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.folder_open_rounded, size: 80.sp, color: Colors.white.withValues(alpha: 0.1)),
          SizedBox(height: 16.h),
          Text('Folder is empty', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: Colors.white)),
          SizedBox(height: 8.h),
          Text('No documents found in this folder.', style: TextStyle(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
