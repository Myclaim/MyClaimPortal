import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  Map<String, dynamic>? _dashboardData;
  Map<String, dynamic>? _profileData;
  bool _isLoading = false;
  String? _errorMessage;

  Map<String, dynamic>? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Map<String, dynamic> get overview => _dashboardData?['overview'] ?? {};

  List<dynamic> get claims {
    final claimsList = List<dynamic>.from(_dashboardData?['claims'] ?? []);
    
    // Check dashboard data first
    var preIpoList = List<dynamic>.from(
      _dashboardData?['preIpos'] ?? 
      _dashboardData?['preIpo'] ?? 
      _dashboardData?['preIpoClaims'] ?? []
    );

    // If empty, check profile data (handling potential 'data' wrapper)
    if (preIpoList.isEmpty && _profileData != null) {
      final profileContent = _profileData!['data'] ?? _profileData;
      if (profileContent is Map<String, dynamic>) {
        preIpoList = List<dynamic>.from(
          profileContent['preIpos'] ?? 
          profileContent['preIpo'] ?? 
          profileContent['preIpoClaims'] ?? []
        );
      }
    }

    return [...claimsList, ...preIpoList];
  }

  Future<void> fetchDashboard() async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await ApiService.getClientDashboard();
      final profile = await ApiService.getClientProfile();
      
      if (data != null) {
        _dashboardData = data;
        _errorMessage = null;
      }
      if (profile != null) {
        _profileData = profile;
      }
    } catch (e) {
      _errorMessage = 'Could not load dashboard. Using cached data.';
    }

    _isLoading = false;
    notifyListeners();
  }
}
