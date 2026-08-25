import sys

with open('lib/screens/quick_actions/referral_screen.dart', 'r') as f:
    referral = f.read()

referral = referral.replace("import '../../utils/constants.dart';", "import '../../utils/constants.dart';\nimport '../../services/api_service.dart';")

old_state = '''class _ReferralScreenState extends State<ReferralScreen> {
  final _emailController = TextEditingController();
  final String _referralCode = 'MYCLAIM2026';'''

new_state = '''class _ReferralScreenState extends State<ReferralScreen> {
  final _emailController = TextEditingController();
  String _referralCode = 'MYCLAIM2026';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCode();
  }

  Future<void> _fetchCode() async {
    final profile = await ApiService.getClientProfile();
    if (mounted && profile != null) {
      setState(() {
        _referralCode = profile['data']?['referralCode'] ?? 'MYCLAIM2026';
        _isLoading = false;
      });
    } else if (mounted) {
      setState(() => _isLoading = false);
    }
  }'''

referral = referral.replace(old_state, new_state)

with open('lib/screens/quick_actions/referral_screen.dart', 'w') as f:
    f.write(referral)
