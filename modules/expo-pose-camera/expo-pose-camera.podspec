Pod::Spec.new do |s|
  s.name           = 'expo-pose-camera'
  s.version        = '0.0.1'
  s.summary        = 'Expo module for real-time pose detection using Apple Vision'
  s.description    = 'Native camera view with body pose detection for exercise form analysis'
  s.author         = ''
  s.homepage       = 'https://github.com/clip2fit'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = 'ios/*.{h,m,mm,swift}', 'ios/**/*.{h,m,mm,swift}'
end
