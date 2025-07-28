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
    mkdir -p ~/.claude-suite/{environment-os,migration-os,debug-os,performance-os}
    
    # Global Claude command directories
    mkdir -p ~/.claude/commands/{agent-os,codebase-os,testing,workflows}
    mkdir -p ~/.claude/commands/{environment-os,migration-os,debug-os,performance-os}
    
    echo "✅ Directories created!"
    echo ""
}

# Install Agent-OS
install_agent_os() {
    echo "🤖 Installing Agent-OS commands..."
    
    if [ -d "agent-os" ]; then
        cp -r agent-os/* ~/.claude-suite/agent-os/ 2>/dev/null || true
        
        for cmd in agent-os/instructions/*.md; do
            if [ -f "$cmd" ]; then
                cp "$cmd" "$HOME/.claude/commands/agent-os/"
                echo "   ✓ $(basename "$cmd")"
            fi
        done
    fi
    
    echo "✅ Agent-OS installed!"
}

# Install Codebase-OS
install_codebase_os() {
    echo "🧹 Installing Codebase-OS commands..."
    
    if [ -d "codebase-os" ]; then
        cp -r codebase-os/* ~/.claude-suite/codebase-os/ 2>/dev/null || true
        
        for cmd in codebase-os/commands/*.md; do
            if [ -f "$cmd" ]; then
                cp "$cmd" "$HOME/.claude/commands/codebase-os/"
                echo "   ✓ $(basename "$cmd")"
            fi
        done
    fi
    
    echo "✅ Codebase-OS installed!"
}

# Install Testing Suite
install_testing_suite() {
    echo "🧪 Installing Testing Suite commands..."
    
    if [ -d "testing-suite" ]; then
        cp -r testing-suite/* ~/.claude-suite/testing/ 2>/dev/null || true
        
        for cmd in testing-suite/commands/*.md; do
            if [ -f "$cmd" ]; then
                cp "$cmd" "$HOME/.claude/commands/testing/"
                echo "   ✓ $(basename "$cmd")"
            fi
        done
    fi
    
    echo "✅ Testing Suite installed!"
}

# Install Environment-OS
install_environment_os() {
    echo "🌍 Installing Environment-OS..."
    
    if [ -d "environment-os" ]; then
        cp -r environment-os/* ~/.claude-suite/environment-os/ 2>/dev/null || true
        
        for cmd in environment-os/commands/*.md; do
            if [ -f "$cmd" ]; then
                filename=$(basename "$cmd")
                cp "$cmd" "$HOME/.claude/commands/environment-os/$filename"
                echo "   ✓ /environment-os/$filename"
            fi
        done
    fi
    
    echo "✅ Environment-OS installed!"
}

# Install Migration-OS
install_migration_os() {
    echo "🗄️ Installing Migration-OS..."
    
    if [ -d "migration-os" ]; then
        cp -r migration-os/* ~/.claude-suite/migration-os/ 2>/dev/null || true
        
        for cmd in migration-os/commands/*.md; do
            if [ -f "$cmd" ]; then
                filename=$(basename "$cmd")
                cp "$cmd" "$HOME/.claude/commands/migration-os/$filename"
                echo "   ✓ /migration-os/$filename"
            fi
        done
    fi
    
    echo "✅ Migration-OS installed!"
}

# Install Debug-OS
install_debug_os() {
    echo "🐛 Installing Debug-OS..."
    
    if [ -d "debug-os" ]; then
        cp -r debug-os/* ~/.claude-suite/debug-os/ 2>/dev/null || true
        
        for cmd in debug-os/commands/*.md; do
            if [ -f "$cmd" ]; then
                filename=$(basename "$cmd")
                cp "$cmd" "$HOME/.claude/commands/debug-os/$filename"
                echo "   ✓ /debug-os/$filename"
            fi
        done
    fi
    
    echo "✅ Debug-OS installed!"
}

# Install Performance-OS
install_performance_os() {
    echo "⚡ Installing Performance-OS..."
    
    if [ -d "performance-os" ]; then
        cp -r performance-os/* ~/.claude-suite/performance-os/ 2>/dev/null || true
        
        for cmd in performance-os/commands/*.md; do
            if [ -f "$cmd" ]; then
                filename=$(basename "$cmd")
                cp "$cmd" "$HOME/.claude/commands/performance-os/$filename"
                echo "   ✓ /performance-os/$filename"
            fi
        done
    fi
    
    echo "✅ Performance-OS installed!"
}

# Install workflows
install_workflows() {
    echo "🔄 Installing workflows..."
    
    if [ -d "workflows" ]; then
        for workflow in workflows/*.md; do
            if [ -f "$workflow" ]; then
                filename=$(basename "$workflow")
                cp "$workflow" "$HOME/.claude/commands/workflows/$filename"
                echo "   ✓ /workflows/$filename"
            fi
        done
    fi
    
    echo "✅ Workflows installed!"
}

# Install standards
install_standards() {
    echo "📏 Installing development standards..."
    
    if [ -d "standards" ]; then
        cp -r standards/* ~/.claude-suite/standards/ 2>/dev/null || true
        echo "   ✓ Code style standards"
        echo "   ✓ Tech stack defaults"
        echo "   ✓ Best practices"
    fi
    
    echo "✅ Standards installed!"
}

# Main installation
main() {
    check_prerequisites
    setup_directories
    
    # Install all OS components
    install_agent_os
    install_codebase_os
    install_testing_suite
    install_environment_os
    install_migration_os
    install_debug_os
    install_performance_os
    
    # Install workflows and standards
    install_workflows
    install_standards
    
    echo ""
    echo "🎉 v2.0 Agent System Installation Complete!"
    echo "=========================================="
    echo ""
    echo "📚 Installed Commands:"
    echo ""
    echo "🤖 Agent-OS (Planning & Building):"
    echo "  /plan-product      - Plan new features"
    echo "  /create-spec       - Create specifications"
    echo "  /execute-tasks     - Execute development"
    echo "  /analyze-product   - Analyze codebase"
    echo ""
    echo "🧹 Codebase-OS (Code Quality):"
    echo "  /analyze-codebase  - Health check"
    echo "  /clean-codebase    - Automated cleanup"
    echo "  /refactor-smart    - Smart refactoring"
    echo "  /monitor-quality   - Track trends"
    echo ""
    echo "🧪 Testing Suite:"
    echo "  /fix-and-test      - Complete testing"
    echo "  /pre-deploy-check  - Quick validation"
    echo "  /test-core-flows   - User journey tests"
    echo "  /railway-deploy    - Railway deployment"
    echo ""
    echo "🌍 Environment-OS (NEW!):"
    echo "  /setup-environment - Auto-setup dev env"
    echo "  /sync-prod-config  - Sync with production"
    echo "  /debug-environment - Fix env issues"
    echo ""
    echo "🗄️ Migration-OS (NEW!):"
    echo "  /generate-migration - Create migrations"
    echo "  /test-migration     - Test safely"
    echo "  /rollback-safe      - Instant rollback"
    echo ""
    echo "🐛 Debug-OS (NEW!):"
    echo "  /reproduce-error    - Reproduce locally"
    echo "  /debug-production   - Debug safely"
    echo "  /debug-timeline     - Time-travel debug"
    echo ""
    echo "⚡ Performance-OS (NEW!):"
    echo "  /profile-performance - Full analysis"
    echo "  /optimize-critical   - Auto-optimize"
    echo "  /implement-caching   - Smart caching"
    echo ""
    echo "🔄 Workflows:"
    echo "  /daily-dev         - Daily workflow"
    echo "  /pre-deploy        - Pre-deployment"
    echo "  /help              - Show all commands"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Run 'claude' to start Claude Code"
    echo "2. Type '/help' to see all commands"
    echo "3. Start with '/setup-environment' for new projects"
    echo ""
    echo "Happy coding! 🎯"
}

# Run main installation
main
