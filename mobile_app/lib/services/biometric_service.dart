import 'package:local_auth/local_auth.dart';

class BiometricService {
  static final LocalAuthentication _auth = LocalAuthentication();

  /// Check if this device supports biometrics and has them enrolled
  static Future<bool> isAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();
      if (!canCheck || !isDeviceSupported) return false;
      final biometrics = await _auth.getAvailableBiometrics();
      return biometrics.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Authenticate with biometric.
  /// usePasscodeFallback: false = biometric only; true = also allows PIN fallback
  static Future<bool> authenticate({bool usePasscodeFallback = true}) async {
    try {
      final result = await _auth.authenticate(
        localizedReason: 'Place your finger on the sensor to access MyClaim',
        biometricOnly: !usePasscodeFallback,
        // sensitiveTransaction: true = system shows standard confirmation dialog (default)
        // This is more compatible with OEM devices like Oppo ColorOS
      );
      return result;
    } on Exception {
      return false;
    }
  }

  /// Authenticate using only device credentials (PIN/pattern/password)
  static Future<bool> authenticateWithDeviceCredentials() async {
    try {
      final result = await _auth.authenticate(
        localizedReason: 'Enter your device PIN or password to access MyClaim',
        biometricOnly: false,
      );
      return result;
    } on Exception {
      return false;
    }
  }

  /// Stop any in-progress authentication
  static Future<void> stopAuthentication() async {
    try {
      await _auth.stopAuthentication();
    } catch (_) {}
  }
}
