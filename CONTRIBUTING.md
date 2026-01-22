# Contributing to SnapEat

First off, thank you for considering contributing to SnapEat! It's people like you that make SnapEat such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript/Python styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/SnapEat.git
cd SnapEat

# Add upstream remote
git remote add upstream https://github.com/thinhtapcode/SnapEat.git
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Setup Development Environment

Follow the [Quick Start Guide](QUICKSTART.md) to set up your development environment.

### 4. Make Your Changes

* Write clear, commented code
* Follow existing code style
* Add or update tests as needed
* Update documentation as needed

### 5. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in meal logging"
git commit -m "docs: update README"
git commit -m "style: format code"
git commit -m "refactor: improve TDEE calculation"
git commit -m "test: add tests for auth module"
git commit -m "chore: update dependencies"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Styleguides

### TypeScript Styleguide

* Use TypeScript for all new code
* Follow existing code style
* Use meaningful variable names
* Add JSDoc comments for functions
* Use async/await instead of promises
* Use ES6+ features
* Maximum line length: 100 characters

Example:
```typescript
/**
 * Calculate user's TDEE based on profile data
 * @param userId - The user's unique identifier
 * @returns TDEE calculation result
 */
async calculateTDEE(userId: string): Promise<TDEEResult> {
  const profile = await this.getProfile(userId);
  // Implementation
}
```

### Python Styleguide

* Follow PEP 8
* Use type hints
* Use docstrings for functions
* Maximum line length: 100 characters

Example:
```python
def recognize_food(image: Image) -> List[RecognizedFood]:
    """
    Recognize food items from image using AI model
    
    Args:
        image: PIL Image object
        
    Returns:
        List of recognized food items with nutrition data
    """
    # Implementation
```

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Project Structure

```
SnapEat/
├── apps/
│   ├── backend/          # NestJS API
│   ├── ai-service/       # FastAPI service
│   ├── web/             # React web app
│   └── mobile/          # React Native app
├── packages/
│   └── shared/          # Shared types
├── docs/                # Documentation (if added)
└── scripts/             # Build/deployment scripts (if added)
```

## Testing

### Backend Tests
```bash
cd apps/backend
npm test
npm run test:watch
npm run test:cov
```

### Web Tests
```bash
cd apps/web
npm test
```

### AI Service Tests
```bash
cd apps/ai-service
pytest
```

## Documentation

* Update README.md if you change functionality
* Update API documentation if you add/modify endpoints
* Add JSDoc/docstrings to new functions
* Update ARCHITECTURE.md for architectural changes

## Areas to Contribute

### Backend
- [ ] Add more comprehensive tests
- [ ] Implement refresh token rotation
- [ ] Add rate limiting
- [ ] Improve error handling
- [ ] Add request validation middleware

### AI Service
- [ ] Integrate real ML model for food recognition
- [ ] Add confidence thresholds
- [ ] Implement batch processing
- [ ] Add model versioning
- [ ] Improve nutrition database

### Web App
- [ ] Improve UI/UX design
- [ ] Add dark mode
- [ ] Implement offline support
- [ ] Add PWA features
- [ ] Improve accessibility

### Mobile App
- [ ] Implement actual camera integration
- [ ] Add offline meal logging
- [ ] Implement push notifications
- [ ] Add biometric authentication
- [ ] Optimize performance

### DevOps
- [ ] Add CI/CD pipeline
- [ ] Improve Docker configurations
- [ ] Add Kubernetes manifests
- [ ] Set up monitoring
- [ ] Add performance testing

### Documentation
- [ ] Add API examples
- [ ] Create video tutorials
- [ ] Write architecture decision records
- [ ] Add troubleshooting guide
- [ ] Translate documentation

## Review Process

1. **Automated Checks**: CI/CD runs tests and linters
2. **Code Review**: At least one maintainer reviews the code
3. **Testing**: Changes are tested in development environment
4. **Approval**: Maintainer approves and merges

## Release Process

We use semantic versioning (SemVer):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

## Questions?

Feel free to:
- Open an issue with the "question" label
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project website (when available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SnapEat! 🎉
