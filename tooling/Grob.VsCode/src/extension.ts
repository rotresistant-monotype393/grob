// Grob VS Code extension — Phase 1 (TextMate grammar only)
// Phase 3 will add LSP integration via grob-lsp server process.
import * as vscode from 'vscode';

export function activate(_context: vscode.ExtensionContext): void {
    // Phase 1: grammar activation is handled declaratively via package.json.
    // No programmatic activation needed until Phase 3 (LSP).
}

export function deactivate(): void {
    // Nothing to clean up in Phase 1.
}
