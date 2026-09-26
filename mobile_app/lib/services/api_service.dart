import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Hosted backend on Wealtharth
  static const String baseUrl = 'https://api.wealtharth.com/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// POST /api/auth/login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 4)); // Time out quickly if server is asleep

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      }
      return {'success': false, 'message': data['message'] ?? 'Login failed'};
    } catch (e) {
      // Re-throw so AuthProvider catches it and triggers the Mock Bypass
      rethrow;
    }
  }

  /// GET /api/dashboard/client
  static Future<Map<String, dynamic>?> getClientDashboard() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/dashboard/client'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors, return null to show fallback data
    }
    return null;
  }

  /// GET /api/activities/client
  static Future<Map<String, dynamic>?> getClientActivities() async {
    try {
      final headers = await _getHeaders();
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('user');
      String url = '$baseUrl/activity';
      if (userStr != null) {
        final userObj = jsonDecode(userStr);
        if (userObj['_id'] != null) {
          url += '?user_id=${userObj['_id']}';
        }
      }
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final list = jsonDecode(response.body) as List<dynamic>;
        return {'data': list};
      }
    } catch (e) {
      // ignore errors
    }
    return null;
  }

  static Future<Map<String, dynamic>?> getNotifications() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors
    }
    return null;
  }

  /// GET /api/users/client/profile
  static Future<Map<String, dynamic>?> getClientProfile() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/users/client/profile'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors
    }
    return null;
  }

  /// PATCH /api/users/client/profile (Update Password)
  static Future<Map<String, dynamic>> updateClientPassword(String currentPassword, String newPassword) async {
    try {
      final headers = await _getHeaders();
      final response = await http.patch(
        Uri.parse('$baseUrl/users/client/profile'),
        headers: headers,
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Password updated successfully'};
      }
      return {'success': false, 'message': data['message'] ?? 'Failed to update password'};
    } catch (e) {
      return {'success': false, 'message': 'Connection error'};
    }
  }

  /// GET /api/documents
  static Future<List<dynamic>> getDocuments() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/documents'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors
    }
    return [];
  }

  /// GET /api/tickets
  static Future<List<dynamic>> getTickets() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/tickets'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors
    }
    return [];
  }

  /// GET /api/documents/company
  static Future<List<dynamic>> getCompanyDocuments() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/documents/company'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors
    }
    return [];
  }

  /// GET /api/documents/legal
  static Future<List<dynamic>> getLegalDocuments() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/documents/legal'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // ignore errors
    }
    return [];
  }

  /// POST /api/documents/upload - Multipart upload
  static Future<bool> uploadDocument({
    required String filePath,
    required String name,
    required String folder,
    required String docCategory,
    required String clientId,
  }) async {
    try {
      final token = await getToken();
      final uri = Uri.parse('$baseUrl/documents/upload');
      final request = http.MultipartRequest('POST', uri);
      
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      
      request.fields['name'] = name;
      request.fields['linked_to'] = 'client';
      request.fields['doc_category'] = docCategory;
      request.fields['folder'] = folder;
      request.fields['client_id'] = clientId;
      
      final file = await http.MultipartFile.fromPath('file', filePath);
      request.files.add(file);
      
      final response = await request.send();
      if (response.statusCode == 201) {
        return true;
      } else {
        final respBody = await response.stream.bytesToString();
        debugPrint('Upload failed with status ${response.statusCode}: $respBody');
        throw Exception('Status ${response.statusCode}: $respBody');
      }
    } catch (e) {
      debugPrint('Error uploading document: $e');
      throw Exception(e.toString());
    }
  }

  // ─── PARTNER ENDPOINTS ─────────────────────────────────────────────────────

  /// GET /api/leads — returns only leads where sourceUserId == partnerId
  static Future<List<dynamic>> getPartnerLeads(String partnerId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/leads'), headers: headers);
      if (response.statusCode == 200) {
        final all = jsonDecode(response.body) as List<dynamic>;
        return all.where((l) {
          final src = l['sourceUserId'];
          final srcId = src is Map ? src['_id']?.toString() : src?.toString();
          return srcId == partnerId;
        }).toList();
      }
    } catch (e) {
      debugPrint('getPartnerLeads error: $e');
    }
    return [];
  }

  /// POST /api/leads — create a new lead
  static Future<Map<String, dynamic>> createLead(Map<String, dynamic> payload) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/leads'),
        headers: headers,
        body: jsonEncode(payload),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201 || response.statusCode == 200) {
        return {'success': true, 'data': data};
      }
      return {'success': false, 'message': data['message'] ?? 'Failed to create lead'};
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  /// GET /api/users — returns only users with role == 'client'
  static Future<List<dynamic>> getPartnerClients() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/users'), headers: headers);
      if (response.statusCode == 200) {
        final all = jsonDecode(response.body) as List<dynamic>;
        return all.where((u) => u['role']?.toString() == 'client').toList();
      }
    } catch (e) {
      debugPrint('getPartnerClients error: $e');
    }
    return [];
  }

  /// GET /api/tickets
  static Future<List<dynamic>> getPartnerTickets() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/tickets'), headers: headers);
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
    } catch (e) {
      debugPrint('getPartnerTickets error: $e');
    }
    return [];
  }

  /// GET /api/catalog — returns distinct mainCategories for the home screen
  static Future<List<String>> getCategories() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/catalog'),
        headers: headers,
      ).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final list = jsonDecode(response.body) as List<dynamic>;
        final seen = <String>{};
        final cats = <String>[];
        for (final item in list) {
          final cat = item['mainCategory']?.toString();
          if (cat != null && cat.isNotEmpty && seen.add(cat)) {
            cats.add(cat);
          }
        }
        if (cats.isNotEmpty) return cats;
      }
    } catch (e) {
      debugPrint('getCategories error: $e');
    }
    // Fallback categories
    return ['IEPF Claims', 'Share Transfer', 'KYC Update', 'Legal Heir', 'Dividend Recovery', 'Mutual Funds'];
  }

  /// GET /api/activity
  static Future<List<dynamic>> getPartnerActivity() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/activity'), headers: headers);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body is List) return body;
        if (body is Map && body['data'] is List) return body['data'] as List;
      }
    } catch (e) {
      debugPrint('getPartnerActivity error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>> submitPartnerRequest({
    required String fullName,
    required String email,
    required String phone,
    required String profession,
    String? regNo,
    required String city,
    required String state,
    String? about,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/partner-requests'),
        headers: headers,
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'phone': phone,
          'profession': profession,
          'regNo': regNo ?? '',
          'city': city,
          'state': state,
          'about': about ?? '',
        }),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 201) {
        return {'success': true, 'message': body['message']};
      }
      return {'success': false, 'message': body['message'] ?? 'Something went wrong'};
    } catch (e) {
      return {'success': false, 'message': 'Could not connect to server.'};
    }
  }

  static Future<Map<String, dynamic>> submitClientRequest({
    required String fullName,
    required String email,
    required String phone,
    required String service,
    required String city,
    required String state,
    String? companyOrFolio,
    String? details,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/client-requests'),
        headers: headers,
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'phone': phone,
          'service': service,
          'city': city,
          'state': state,
          'companyOrFolio': companyOrFolio ?? '',
          'details': details ?? '',
        }),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 201) {
        return {'success': true, 'message': body['message']};
      }
      return {'success': false, 'message': body['message'] ?? 'Something went wrong'};
    } catch (e) {
      return {'success': false, 'message': 'Could not connect to server.'};
    }
  }

  static Future<Map<String, dynamic>> sendIepfOtp({
    required String target,
    required String type, // 'email' or 'mobile'
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/iepf-reports/send-otp'),
        headers: headers,
        body: jsonEncode({'target': target, 'type': type}),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return {'success': true, 'message': body['message']};
      }
      return {'success': false, 'message': body['message'] ?? 'Failed to send OTP.'};
    } catch (_) {
      return {'success': false, 'message': 'Could not connect to server. Please try again.'};
    }
  }

  static Future<Map<String, dynamic>> verifyIepfOtp({
    required String target,
    required String otp,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/iepf-reports/verify-otp'),
        headers: headers,
        body: jsonEncode({'target': target, 'otp': otp}),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return {'success': true, 'message': body['message']};
      }
      return {'success': false, 'message': body['message'] ?? 'Invalid OTP code.'};
    } catch (_) {
      return {'success': false, 'message': 'Could not connect to verification server.'};
    }
  }

  static Future<Map<String, dynamic>> submitIepfReportRequest({
    required String fullName,
    required String panNumber,
    required String email,
    required String mobile,
    String? folioOrDpId,
    String? companyName,
    String? oldAddressProofName,
    List<String>? shareDocsNames,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/iepf-reports'),
        headers: headers,
        body: jsonEncode({
          'fullName': fullName,
          'panNumber': panNumber,
          'email': email,
          'mobile': mobile,
          'folioOrDpId': folioOrDpId ?? '',
          'companyName': companyName ?? '',
          'oldAddressProofName': oldAddressProofName ?? '',
          'shareDocsNames': shareDocsNames ?? [],
        }),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 201) {
        return {'success': true, 'message': body['message']};
      }
      return {'success': false, 'message': body['message'] ?? 'Submission failed.'};
    } catch (e) {
      return {'success': false, 'message': 'Could not connect to server.'};
    }
  }
}

