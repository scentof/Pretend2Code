// VSCode Clone JavaScript Logic

class VSCodeClone {
    constructor() {
        this.recentFiles = this.loadRecentFiles();
        this.currentFile = null;
        
        // Progressive reveal state
        this.originalContent = '';
        this.revealedContent = '';
        this.revealIndex = 0;
        this.isProgressiveMode = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRecentFiles();
        this.updateLineNumbers();
    }

    bindEvents() {
        // Open File button click
        const openFileBtn = document.getElementById('open-file-btn');
        const fileInput = document.getElementById('file-input');
        
        openFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Close tab button
        const closeTab = document.getElementById('close-tab');
        closeTab.addEventListener('click', () => {
            this.closeEditor();
        });

        // Code editor input for line numbers update
        const codeEditor = document.getElementById('code-editor');
        codeEditor.addEventListener('input', () => {
            this.updateLineNumbers();
        });

        codeEditor.addEventListener('scroll', () => {
            this.syncLineNumbersScroll();
        });

        // Progressive reveal keydown handler
        codeEditor.addEventListener('keydown', (e) => {
            this.handleProgressiveReveal(e);
        });

        // Recent file clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.recent-item')) {
                const recentItem = e.target.closest('.recent-item');
                const fileIndex = parseInt(recentItem.dataset.fileIndex);
                if (fileIndex >= 0 && fileIndex < this.recentFiles.length) {
                    const file = this.recentFiles[fileIndex];
                    this.openFileInEditor(file.name, file.content);
                }
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.openFileInEditor(file.name, content);
            this.addToRecentFiles(file.name, content);
            
            // Clear the file input value to allow selecting the same file again
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    openFileInEditor(fileName, content) {
        this.currentFile = { name: fileName, content: content };
        
        // Initialize progressive reveal state
        this.originalContent = content;
        this.revealedContent = '';
        this.revealIndex = 0;
        this.isProgressiveMode = true;
        
        // Hide welcome page and show editor
        document.getElementById('welcome-page').style.display = 'none';
        document.getElementById('editor-page').style.display = 'flex';
        
        // Update tab name
        document.getElementById('tab-name').textContent = fileName;
        
        // Set editor content to empty initially
        const codeEditor = document.getElementById('code-editor');
        codeEditor.value = '';
        
        // Update line numbers
        this.updateLineNumbers();
        
        // Focus on editor
        codeEditor.focus();
    }

    closeEditor() {
        // Show welcome page and hide editor
        document.getElementById('welcome-page').style.display = 'block';
        document.getElementById('editor-page').style.display = 'none';
        
        // Clear current file and progressive reveal state
        this.currentFile = null;
        this.originalContent = '';
        this.revealedContent = '';
        this.revealIndex = 0;
        this.isProgressiveMode = false;
        
        // Clear editor content
        document.getElementById('code-editor').value = '';
        document.getElementById('tab-name').textContent = 'Untitled';
    }

    updateLineNumbers() {
        const codeEditor = document.getElementById('code-editor');
        const lineNumbers = document.getElementById('line-numbers');
        
        const lines = codeEditor.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<div class="line-number">${i}</div>`;
        }
        
        lineNumbers.innerHTML = lineNumbersHTML;
    }

    syncLineNumbersScroll() {
        const codeEditor = document.getElementById('code-editor');
        const lineNumbers = document.getElementById('line-numbers');
        lineNumbers.scrollTop = codeEditor.scrollTop;
    }

    addToRecentFiles(fileName, content) {
        // Remove if already exists
        this.recentFiles = this.recentFiles.filter(file => file.name !== fileName);
        
        // Add to beginning
        this.recentFiles.unshift({
            name: fileName,
            content: content,
            timestamp: new Date().toISOString(),
            path: `Local File: ${fileName}`
        });
        
        // Keep only last 10 files
        this.recentFiles = this.recentFiles.slice(0, 10);
        
        // Save to localStorage
        this.saveRecentFiles();
        
        // Re-render recent files
        this.renderRecentFiles();
    }

    renderRecentFiles() {
        const recentFilesList = document.getElementById('recent-files-list');
        
        if (this.recentFiles.length === 0) {
            recentFilesList.innerHTML = '<div class="recent-empty">No recent files</div>';
            return;
        }
        
        let html = '';
        this.recentFiles.forEach((file, index) => {
            const fileExtension = this.getFileExtension(file.name);
            const fileIcon = this.getFileIcon(fileExtension);
            
            html += `
                <div class="recent-item" data-file-index="${index}">
                    <i class="${fileIcon}"></i>
                    <div>
                        <div class="recent-name">${this.escapeHtml(file.name)}</div>
                        <div class="recent-path">${this.escapeHtml(file.path)}</div>
                    </div>
                </div>
            `;
        });
        
        recentFilesList.innerHTML = html;
    }

    getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }

    getFileIcon(extension) {
        const iconMap = {
            'js': 'fab fa-js-square',
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'py': 'fab fa-python',
            'java': 'fab fa-java',
            'cpp': 'fas fa-code',
            'c': 'fas fa-code',
            'json': 'fas fa-file-code',
            'xml': 'fas fa-file-code',
            'md': 'fab fa-markdown',
            'txt': 'fas fa-file-alt',
            'php': 'fab fa-php'
        };
        
        return iconMap[extension] || 'fas fa-file';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadRecentFiles() {
        try {
            const saved = localStorage.getItem('vscode-clone-recent-files');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading recent files:', e);
            return [];
        }
    }

    saveRecentFiles() {
        try {
            localStorage.setItem('vscode-clone-recent-files', JSON.stringify(this.recentFiles));
        } catch (e) {
            console.error('Error saving recent files:', e);
        }
    }

    // Utility method to format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Method to get file type for syntax highlighting (future enhancement)
    getFileType(fileName) {
        const extension = this.getFileExtension(fileName);
        const typeMap = {
            'js': 'javascript',
            'html': 'html',
            'css': 'css',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown',
            'php': 'php'
        };
        
        return typeMap[extension] || 'text';
    }

    handleProgressiveReveal(e) {
        if (!this.isProgressiveMode || !this.originalContent) {
            return;
        }

        // Prevent default behavior for most keys
        e.preventDefault();

        const codeEditor = document.getElementById('code-editor');
        
        // Handle Backspace key - hide last revealed character
        if (e.key === 'Backspace') {
            if (this.revealIndex > 0) {
                this.revealIndex--;
                this.revealedContent = this.originalContent.substring(0, this.revealIndex);
                codeEditor.value = this.revealedContent;
                this.updateLineNumbers();
                
                // Set cursor to end
                codeEditor.setSelectionRange(this.revealedContent.length, this.revealedContent.length);
            }
            return;
        }

        // Handle keys that should reveal next character
        const revealKeys = [
            'Enter', ' ', // Special keys
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+',
            '[', ']', '{', '}', '\\', '|', ';', ':', '\'', '"', ',', '.', '<', '>',
            '/', '?', '`', '~'
        ];

        if (revealKeys.includes(e.key)) {
            if (this.revealIndex < this.originalContent.length) {
                this.revealIndex++;
                this.revealedContent = this.originalContent.substring(0, this.revealIndex);
                codeEditor.value = this.revealedContent;
                this.updateLineNumbers();
                
                // Set cursor to end
                codeEditor.setSelectionRange(this.revealedContent.length, this.revealedContent.length);
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vsCodeClone = new VSCodeClone();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+O to open file
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        document.getElementById('file-input').click();
    }
    
    // Ctrl+W to close tab
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const editorPage = document.getElementById('editor-page');
        if (editorPage.style.display !== 'none') {
            document.getElementById('close-tab').click();
        }
    }
    
    // Escape to go back to welcome page
    if (e.key === 'Escape') {
        const editorPage = document.getElementById('editor-page');
        if (editorPage.style.display !== 'none') {
            document.getElementById('close-tab').click();
        }
    }
});

