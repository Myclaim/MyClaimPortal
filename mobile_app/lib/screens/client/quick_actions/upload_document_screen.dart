import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../../../utils/constants.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class UploadDocumentScreen extends StatefulWidget {
  const UploadDocumentScreen({super.key});

  @override
  State<UploadDocumentScreen> createState() => _UploadDocumentScreenState();
}

class _UploadDocumentScreenState extends State<UploadDocumentScreen> {
  final List<_DocItem> _queue = [];
  final ImagePicker _picker = ImagePicker();
  String _selectedCategory = 'KYC';
  bool _isUploading = false;

  final List<String> _categories = [
    'KYC',
    'PAN Card',
    'Cheque',
    'Legal',
    'Other'
  ];

  Future<void> _pickGallery() async {
    final List<XFile> images = await _picker.pickMultiImage();
    if (images.isNotEmpty) {
      setState(() {
        for (var img in images) {
          _queue.add(_DocItem(
            path: img.path,
            name: img.name,
            size: 'Unknown Size',
            type: 'Image',
            category: _selectedCategory,
          ));
        }
      });
    }
  }

  Future<void> _pickFiles() async {
    FilePickerResult? result = await FilePicker.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );
    if (result != null) {
      setState(() {
        for (var file in result.files) {
          _queue.add(_DocItem(
            path: file.path ?? '',
            name: file.name,
            size: '${(file.size / 1024).toStringAsFixed(1)} KB',
            type: file.extension?.toUpperCase() ?? 'FILE',
            category: _selectedCategory,
          ));
        }
      });
    }
  }

  Future<void> _scanPdf() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() {
        _queue.add(_DocItem(
          path: photo.path,
          name: 'Scanned_Doc_${DateTime.now().millisecondsSinceEpoch}.jpg',
          size: 'Unknown Size',
          type: 'Scan',
          category: _selectedCategory,
        ));
      });
    }
  }

  void _uploadFiles() async {
    if (_queue.isEmpty) return;
    setState(() => _isUploading = true);
    
    final authProvider = context.read<AuthProvider>();
    final clientId = authProvider.user?['_id'] ?? authProvider.user?['id'] ?? '';
    
    bool allSuccess = true;
    String errorMessage = '';
    for (var item in _queue) {
      if (item.path.isEmpty) continue;
      try {
        await ApiService.uploadDocument(
          filePath: item.path,
          name: item.name,
          folder: 'Uploads',
          docCategory: 'secondary', // Must be one of ['primary', 'secondary', 'internal', 'company', 'legal']
          clientId: clientId.toString(),
        );
      } catch (e) {
        allSuccess = false;
        errorMessage = e.toString();
        break; // stop on first error to show it
      }
    }
    
    if (!mounted) return;
    setState(() => _isUploading = false);
    
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
        title: Icon(allSuccess ? Icons.check_circle_rounded : Icons.error_outline_rounded, color: allSuccess ? AppColors.success : AppColors.error, size: 48.sp),
        content: Text(
          allSuccess ? 'Documents uploaded successfully!' : 'Upload failed:\n$errorMessage',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 16.sp, color: context.textColor, fontWeight: FontWeight.bold),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              if (allSuccess) {
                Navigator.pop(context);
              }
            },
            child: Text(allSuccess ? 'Done' : 'Try Again', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      body: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 16.h, bottom: 24.h, left: 16.w, right: 16.w),
            decoration: const BoxDecoration(
              gradient: AppColors.greenGradient,
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: EdgeInsets.all(8.r),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.arrow_back, color: Colors.white, size: 24.sp),
                  ),
                ),
                SizedBox(width: 16.w),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Upload Documents', style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.bold, color: Colors.white)),
                    SizedBox(height: 4.h),
                    Text('Add files, images or scan a PDF', style: GoogleFonts.inter(fontSize: 12.sp, color: Colors.white.withValues(alpha: 0.8))),
                  ],
                ),
              ],
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(20.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category
                  Text('Document Category', style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor)),
                  SizedBox(height: 16.h),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    clipBehavior: Clip.none,
                    child: Row(
                      children: _categories.map((cat) {
                        final isSelected = _selectedCategory == cat;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedCategory = cat),
                          child: Container(
                            margin: EdgeInsets.only(right: 12.w),
                            padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primary : context.surfaceColor,
                              borderRadius: BorderRadius.circular(24.r),
                              border: Border.all(color: isSelected ? AppColors.primary : context.borderColor),
                            ),
                            child: Text(
                              cat,
                              style: GoogleFonts.inter(
                                fontSize: 13.sp,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                color: isSelected ? Colors.white : context.textSecondaryColor,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  SizedBox(height: 32.h),

                  // Actions Row
                  Text('Add Documents', style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor)),
                  SizedBox(height: 16.h),
                  Row(
                    children: [
                      _buildActionCard(Icons.image_outlined, 'Gallery', 'Pick images', const Color(0xFFE0E7FF), const Color(0xFF4F46E5), _pickGallery),
                      SizedBox(width: 12.w),
                      _buildActionCard(Icons.folder_open_rounded, 'Files', 'PDF, DOC, etc.', const Color(0xFFFEF3C7), const Color(0xFFD97706), _pickFiles),
                      SizedBox(width: 12.w),
                      _buildActionCard(Icons.document_scanner_outlined, 'Scan PDF', 'Use camera', const Color(0xFFD1FAE5), const Color(0xFF059669), _scanPdf),
                    ],
                  ),
                  
                  SizedBox(height: 24.h),
                  
                  // Empty State or Queue List
                  if (_queue.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(vertical: 40.h),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20.r),
                        border: Border.all(color: const Color(0xFFD1FAE5), width: 2),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.cloud_upload_outlined, color: const Color(0xFF6EE7B7), size: 64.sp),
                          SizedBox(height: 16.h),
                          Text('No files selected yet', style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: const Color(0xFF475569))),
                          SizedBox(height: 8.h),
                          Text('Use the buttons above to add documents', style: GoogleFonts.inter(fontSize: 12.sp, color: const Color(0xFF64748B))),
                        ],
                      ),
                    )
                  else
                    Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Selected Files (${_queue.length})', style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: context.textColor)),
                            GestureDetector(
                              onTap: () => setState(() => _queue.clear()),
                              child: Text('Clear All', style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.error, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                        SizedBox(height: 16.h),
                        ..._queue.asMap().entries.map((entry) {
                          final index = entry.key;
                          final item = entry.value;
                          return Container(
                            margin: EdgeInsets.only(bottom: 12.h),
                            padding: EdgeInsets.all(12.r),
                            decoration: BoxDecoration(
                              color: context.surfaceColor,
                              borderRadius: BorderRadius.circular(12.r),
                              border: Border.all(color: context.borderColor),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: EdgeInsets.all(8.r),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8.r),
                                  ),
                                  child: Icon(Icons.insert_drive_file, color: AppColors.primary, size: 24.sp),
                                ),
                                SizedBox(width: 12.w),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: context.textColor)),
                                      SizedBox(height: 4.h),
                                      Row(
                                        children: [
                                          Container(
                                            padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                                            decoration: BoxDecoration(color: context.borderColor, borderRadius: BorderRadius.circular(4.r)),
                                            child: Text(item.type, style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.bold, color: context.textSecondaryColor)),
                                          ),
                                          SizedBox(width: 8.w),
                                          Text(item.category, style: GoogleFonts.inter(fontSize: 11.sp, color: context.textSecondaryColor)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: Icon(Icons.close_rounded, color: context.textSecondaryColor, size: 20.sp),
                                  onPressed: () => setState(() => _queue.removeAt(index)),
                                )
                              ],
                            ),
                          ).animate().fadeIn().slideX(begin: 0.1);
                        }),
                      ],
                    ),

                  SizedBox(height: 24.h),

                  // Tips Container
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(20.r),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.lightbulb_outline_rounded, color: const Color(0xFF10B981), size: 24.sp),
                        SizedBox(width: 16.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Tips for better scans', style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF10B981))),
                              SizedBox(height: 8.h),
                              _buildTip('Ensure good lighting when scanning'),
                              _buildTip('Keep the document flat and fully in frame'),
                              _buildTip('Accepted: PDF, JPG, PNG, DOC (max 10MB)'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 24.h),
                ],
              ),
            ),
          ),
          
          // Bottom Upload Button
          SafeArea(
            child: Padding(
              padding: EdgeInsets.only(left: 20.w, right: 20.w, bottom: 20.h, top: 8.h),
              child: SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: _queue.isNotEmpty && !_isUploading ? _uploadFiles : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _queue.isNotEmpty ? AppColors.primary : Colors.white,
                    side: _queue.isEmpty ? BorderSide(color: context.borderColor) : BorderSide.none,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                    elevation: _queue.isNotEmpty ? 2 : 0,
                  ),
                  child: _isUploading
                      ? SizedBox(width: 24.w, height: 24.w, child: const CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.cloud_upload_rounded, color: _queue.isNotEmpty ? Colors.white : const Color(0xFF475569)),
                            SizedBox(width: 12.w),
                            Text(
                              _queue.isNotEmpty ? 'Upload ${_queue.length} Files' : 'Add files to upload', 
                              style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold, color: _queue.isNotEmpty ? Colors.white : const Color(0xFF475569)),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTip(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 4.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('• ', style: GoogleFonts.inter(fontSize: 12.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.bold)),
          Expanded(child: Text(text, style: GoogleFonts.inter(fontSize: 12.sp, color: const Color(0xFF64748B)))),
        ],
      ),
    );
  }

  Widget _buildActionCard(IconData icon, String title, String subtitle, Color circleBg, Color iconColor, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 20.h, horizontal: 8.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16.r),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Container(
                width: 50.w,
                height: 50.w,
                decoration: BoxDecoration(
                  color: circleBg,
                  shape: BoxShape.circle,
                ),
                child: Center(child: Icon(icon, color: iconColor, size: 24.sp)),
              ),
              SizedBox(height: 12.h),
              Text(title, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              SizedBox(height: 4.h),
              Text(subtitle, style: GoogleFonts.inter(fontSize: 10.sp, color: const Color(0xFF64748B))),
            ],
          ),
        ),
      ),
    );
  }
}

class _DocItem {
  final String path;
  final String name;
  final String size;
  final String type;
  final String category;

  _DocItem({required this.path, required this.name, required this.size, required this.type, required this.category});
}
