#!/bin/bash

# Claude Productivity Suite - v2.0 Agent System Installer
# This installs only the command-based development system

set -e

echo "🎯 Claude Productivity Suite v2.0 - Agent System Installer"
echo "========================================================="
echo ""
echo "This will install the command-based development system globally."
echo ""

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v claude &> /dev/null; then
        echo "❌ Claude Code not found. Please install it first:"
        echo "   npm install -g @anthropic-ai/claude-code"
        exit 1
    fi
    
    echo "✅ Prerequisites met!"
    echo ""
}

# Create directory structure
setup_directories() {
    echo "📁 Setting up v2.0 directory structure..."
    
    # Global suite directories
    mkdir -p ~/.claude-suite/{agent-os,codebase-os,testing,standards,reports,templates}
    
    # Global Claude command directories
    mkdir -p ~/.claude/commands/{agent-os,codebase-os,testing,workflows}
    
    echo "✅ Directories created!"
    echo ""
}

# Install commands
install_v2_commands() {
    echo "🤖 Installing Agent-OS commands..."
    for cmd in agent-os/instructions/*.md; do
        if [ -f "$cmd" ]; then
            cp "$cmd" "$HOME/.claude/commands/agent-os/"
            echo "   ✓ $(basename "$cmd")"
        fi
    done
    
    echo ""
    echo "🧹 Installing Codebase-OS commands..."
    for cmd in codebase-os/commands/*.md; do
        if [ -f "$cmd" ]; then
            cp "$cmd" "$HOME/.claude/commands/codebase-os/"
            echo "   ✓ $(basename "$cmd")"
        fi
    done
    
    echo ""
    echo "🧪 Installing Testing Suite commands..."
    for cmd in testing-suite/commands/*.md; do
        if [ -f "$cmd" ]; then
            cp "$cmd" "$HOME/.claude/commands/testing/"
            echo "   ✓ $(basename "$cmd")"
        fi
    done
    
    echo ""
    echo "🔄 Installing Workflows..."
    for workflow in workflows/*.md; do
        if [ -f "$workflow" ]; then
            cp "$workflow" "$HOME/.claude/commands/workflows/"
            echo "   ✓ $(basename "$workflow")"
        fi
    done
}

# Install standards
install_standards() {
    echo ""
    echo "📏 Installing development standards..."
    cp -r standards/* ~/.claude-suite/standards/
    echo "✅ Standards installed!"
}

# Main installation
main() {
    check_prerequisites
    setup_directories
    install_v2_commands
    install_standards
    
    echo ""
    echo "🎉 v2.0 Agent System Installation Complete!"
    echo "=========================================="
    echo ""
    echo "📚 Available Commands:"
    echo "  Planning:     /plan-product, /create-spec, /execute-tasks"
    echo "  Quality:      /analyze-codebase, /clean-codebase, /refactor-smart"
    echo "  Testing:      /fix-and-test, /pre-deploy-check, /test-core-flows"
    echo "  Workflows:    /daily-dev, /pre-deployment"
    echo ""
    echo "🚀 Get started:"
    echo "  1. Run 'claude' in any project"
    echo "  2. Type '/help' to see all commands"
    echo "  3. Start with '/plan-product' for new features"
    echo ""
}

main
