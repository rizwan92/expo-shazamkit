# Contributing to React Native Apple ShazamKit

Thank you for your interest in contributing to React Native Apple ShazamKit! We welcome contributions from the community and are pleased to have you join us.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 16)
- Yarn or npm
- Xcode (for iOS development)
- Android Studio (for Android development)
- Expo CLI

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/expo-shazamkit.git
   cd expo-shazamkit
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Build the module**

   ```bash
   yarn build
   ```

4. **Set up the example project**

   ```bash
   cd example
   yarn install
   ```

5. **Run the example**

   ```bash
   # For iOS
   yarn ios

   # For Android
   yarn android
   ```

## 🔧 Project Structure

```
├── src/                    # TypeScript source code
│   ├── ExpoShazamKit.ts   # Main module interface
│   ├── ExpoShazamKit.types.ts  # TypeScript definitions
│   └── index.ts           # Module exports
├── ios/                   # iOS native implementation
│   ├── ShazamKitModule.swift
│   ├── ShazamDelegate.swift
│   └── ...
├── android/               # Android native implementation
│   └── src/main/java/expo/modules/shazamkit/
├── plugin/                # Expo config plugin
├── example/               # Example app for testing
└── build/                 # Compiled output
```

## 🛠️ Making Changes

### Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the existing code style
   - Add JSDoc comments for new APIs
   - Update TypeScript types as needed

3. **Test your changes**

   ```bash
   # Build the module
   yarn build

   # Test in the example app
   cd example
   yarn ios # or yarn android
   ```

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Use Prettier (configured in the project)
- **Linting**: Use ESLint (configured in the project)

Run linting and formatting:

```bash
yarn lint
yarn format
```

### Commit Messages

Use conventional commit format:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## 🧪 Testing

### Manual Testing

1. **Test on both platforms**

   - iOS: Use the iOS Simulator or physical device
   - Android: Use Android Emulator or physical device

2. **Test different scenarios**
   - Permission handling
   - Network connectivity issues
   - No music playing
   - Different music types

### Automated Testing

Run the test suite:

```bash
yarn test
```

### Testing Checklist

- [ ] Module builds without errors
- [ ] Example app runs on iOS
- [ ] Example app runs on Android
- [ ] All existing functionality still works
- [ ] New features work as expected
- [ ] TypeScript types are correct
- [ ] Documentation is updated

## 📝 Submitting Changes

### Pull Request Process

1. **Update documentation**

   - Update README.md if needed
   - Add/update JSDoc comments
   - Update CHANGELOG.md

2. **Create a pull request**

   - Use a descriptive title
   - Provide a detailed description of changes
   - Reference any related issues
   - Include screenshots/videos for UI changes

3. **Pull request template**

   ```markdown
   ## Description

   Brief description of the changes.

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Tested on iOS
   - [ ] Tested on Android
   - [ ] Added/updated tests

   ## Screenshots/Videos

   If applicable, add screenshots or videos.

   ## Related Issues

   Fixes #123
   ```

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. All discussions must be resolved
4. CI/CD pipeline must pass

## 🚢 Release Process

Releases are handled by maintainers:

1. **Version bump**

   ```bash
   npm version patch|minor|major
   ```

2. **Update CHANGELOG.md**

3. **Create release tag**

   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

4. **Publish to npm**
   ```bash
   npm publish
   ```

## 🐛 Reporting Issues

### Bug Reports

Include:

- Device information (iOS/Android version)
- Expo SDK version
- Steps to reproduce
- Expected vs actual behavior
- Code examples
- Error messages/logs

### Feature Requests

Include:

- Use case description
- Proposed API (if applicable)
- Alternative solutions considered
- Additional context

## 📞 Getting Help

- **Discord**: [Expo Community Discord](https://discord.gg/expo)
- **GitHub Discussions**: [Project Discussions](https://github.com/rizwan92/expo-shazamkit/discussions)
- **Issues**: [GitHub Issues](https://github.com/rizwan92/expo-shazamkit/issues)

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- **Android improvements**: Enhance Android implementation
- **Testing**: Add automated tests
- **Documentation**: Improve docs and examples
- **Performance**: Optimize recognition performance
- **Accessibility**: Improve accessibility support
- **Localization**: Add internationalization support

## 📚 Useful Resources

- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Apple ShazamKit Documentation](https://developer.apple.com/documentation/shazamkit)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🙏 Recognition

Contributors will be recognized in:

- CHANGELOG.md
- README.md contributors section
- GitHub releases

---

Thank you for contributing to React Native Apple ShazamKit! 🎵
