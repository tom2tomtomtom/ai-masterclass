#!/bin/bash

# Claude Productivity Suite - v3.0 Natural Language Installer
# This installs only the natural language AI system

set -e

echo "🌟 Claude Productivity Suite v3.0 - Natural Language Installer"
echo "============================================================="
echo ""
echo "This will install the AI-powered, no-code building system."
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
    echo "📁 Setting up v3.0 directory structure..."
    
    # Create v3 command directory
    mkdir -p ~/.claude/commands/v3
    
    echo "✅ Directories created!"
    echo ""
}

# Install v3 commands
install_v3_commands() {
    echo "🌟 Creating v3.0 natural language commands..."
    
    # Create the main v3 command router
    cat > ~/.claude/commands/v3/natural-language.md << 'EOF'
---
name: natural-language
description: AI-powered natural language building system
---

# Natural Language AI Builder

## Core Commands

### Build Anything
```
/build-this "description of what you want"
```

### Fix Errors
```
/fix-this
```

### View Progress
```
/project-health
```

### Undo Actions
```
/undo-last-action
```

### Use Templates
```
/use-template [saas-starter|ecommerce|marketplace|internal-tools]
```

### Learning Mode
```
/learning-mode on    # Enable explanations
/learning-mode off   # Disable explanations
```

The AI will handle all technical decisions for you!
EOF

    echo "   ✓ natural-language.md"
    
    # Create shortcuts
    ln -sf ~/.claude/commands/v3/natural-language.md ~/.claude/commands/build-this.md
    echo "   ✓ /build-this shortcut"
    
    ln -sf ~/.claude/commands/v3/natural-language.md ~/.claude/commands/fix-this.md
    echo "   ✓ /fix-this shortcut"
    
    ln -sf ~/.claude/commands/v3/natural-language.md ~/.claude/commands/project-health.md
    echo "   ✓ /project-health shortcut"
}

# Install templates
install_templates() {
    echo ""
    echo "📦 Installing enterprise templates..."
    mkdir -p ~/.claude-suite/templates/v3
    
    if [ -d "templates" ]; then
        cp -r templates/* ~/.claude-suite/templates/v3/
        echo "✅ Templates installed!"
    fi
}

# Main installation
main() {
    check_prerequisites
    setup_directories
    install_v3_commands
    install_templates
    
    echo ""
    echo "🎉 v3.0 Natural Language System Installation Complete!"
    echo "===================================================="
    echo ""
    echo "🚀 Get started with natural language:"
    echo '  1. Run "claude" in any directory'
    echo '  2. Type: /build-this "what you want to build"'
    echo '  3. Let AI handle everything!'
    echo ""
    echo "📚 Example commands:"
    echo '  /build-this "online store for selling books"'
    echo '  /build-this "employee vacation tracker"'
    echo '  /build-this "customer support ticket system"'
    echo ""
    echo "🛡️ Safety features:"
    echo "  /undo-last-action  - Revert any mistake"
    echo "  /fix-this          - AI fixes any error"
    echo "  /project-health    - Visual progress tracking"
    echo ""
}

main
