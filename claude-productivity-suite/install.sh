#!/bin/bash

# Claude Productivity Suite - Complete Installation
# Installs both v2.0 Agent System and v3.0 Natural Language System

set -e

echo "🚀 Claude Productivity Suite - Complete Installer"
echo "==============================================="
echo ""
echo "This will install both:"
echo "  • v2.0 Agent-Based Development System (for precise control)"
echo "  • v3.0 Natural Language AI Builder (for rapid development)"
echo ""

# Check if we should proceed
read -p "Continue with installation? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""

# Run both installers
echo "📦 Installing v2.0 Agent System..."
echo "================================="
./install-v2.sh

echo ""
echo "📦 Installing v3.0 Natural Language System..."
echo "==========================================="
./install-v3.sh

echo ""
echo "🎉 Complete Installation Successful!"
echo "==================================="
echo ""
echo "You now have access to BOTH systems:"
echo ""
echo "🎯 v2.0 Commands (Precise Control):"
echo "  /plan-product      - Strategic planning"
echo "  /create-spec       - Detailed specifications"
echo "  /analyze-codebase  - Code health analysis"
echo "  /clean-codebase    - Automated cleanup"
echo "  /pre-deploy-check  - Deployment validation"
echo ""
echo "🌟 v3.0 Commands (Natural Language):"
echo "  /build-this        - Build with plain English"
echo "  /fix-this          - Automatic error fixing"
echo "  /project-health    - Visual dashboard"
echo "  /use-template      - Start with templates"
echo ""
echo "📚 Help Commands:"
echo "  /help              - Show v2.0 commands"
echo "  /help-v3           - Show v3.0 commands"
echo ""
echo "🚀 Quick Start:"
echo '  Developers:  /plan-product "feature-name"'
echo '  Non-Coders:  /build-this "app description"'
echo ""
echo "Happy building! 🎨"
