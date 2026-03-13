Pod::Spec.new do |s|
  s.name           = 'ExpoPoseCamera'
  s.version        = '1.0.0'
  s.summary        = 'Real-time pose detection camera module'
  s.description    = 'Expo module wrapping AVCaptureSession + Apple Vision for real-time body pose detection'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"

  s.frameworks = 'AVFoundation', 'Vision'
end
