class LanguageDetector {
  getLanguage(filePath) {
    const extension = filePath.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'xml':
        return 'xml';
      case 'yaml':
        return 'yaml';
      case 'md':
        return 'markdown';
      case 'vue':
        return 'html';
      default:
        return 'text/plain';
    }
  }
}

export const languageDetector = new LanguageDetector();
