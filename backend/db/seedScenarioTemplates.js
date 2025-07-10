require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const dbName = process.argv[2];

if (!dbName) {
  console.error('Error: Database name not provided as argument.');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const scenarioTemplates = [
  {
    title: 'Meeting Chaos Management',
    description: 'Resolve scheduling conflicts, improve meeting efficiency, and ensure follow-through on action items',
    industry: null, // Cross-industry
    department: null, // Cross-department
    common_roles: ['Manager', 'Team Lead', 'Project Manager', 'Director', 'Executive Assistant'],
    scenario_template: `Our team struggles with chaotic meeting management. We have frequent issues with:
- Double bookings and scheduling conflicts
- Meetings that run over time without clear outcomes
- Action items that get lost and never followed up
- Team members showing up unprepared
- Back-to-back meetings with no buffer time

Current process: {CURRENT_PROCESS}
Team size: {TEAM_SIZE} people
Meeting frequency: {MEETING_FREQUENCY}
Main pain point: {MAIN_PAIN_POINT}

Desired outcome: {DESIRED_OUTCOME}`,
    challenge_categories: ['meeting management', 'scheduling', 'productivity', 'communication'],
    complexity_level: 'medium'
  },
  {
    title: 'Email Overload Management',
    description: 'Streamline email processing, reduce response time, and improve communication efficiency',
    industry: null,
    department: null,
    common_roles: ['Manager', 'Sales Representative', 'Customer Service', 'Executive', 'Consultant'],
    scenario_template: `I'm drowning in email and need to regain control. Current challenges:
- Receiving {EMAIL_VOLUME} emails per day
- Taking {RESPONSE_TIME} to respond to important emails
- Missing critical messages in the flood of communications
- Spending {TIME_SPENT} hours daily on email management
- Difficulty prioritizing urgent vs. important messages

Current email management: {CURRENT_EMAIL_PROCESS}
Email tools available: {EMAIL_TOOLS}
Main frustration: {MAIN_FRUSTRATION}

Goal: {EMAIL_GOAL}`,
    challenge_categories: ['email management', 'communication', 'productivity', 'time management'],
    complexity_level: 'medium'
  },
  {
    title: 'Document Review and Approval Bottleneck',
    description: 'Accelerate document review cycles, improve quality control, and reduce approval delays',
    industry: null,
    department: null,
    common_roles: ['Manager', 'Legal', 'Compliance', 'Quality Assurance', 'Operations Manager'],
    scenario_template: `Our document review and approval process is creating bottlenecks. Issues include:
- Documents taking {REVIEW_TIME} to get approved
- {REVIEW_VOLUME} documents per week requiring review
- Inconsistent review standards across team members
- Multiple revision cycles due to unclear feedback
- Lost documents and missed deadlines

Document types: {DOCUMENT_TYPES}
Review team size: {REVIEW_TEAM_SIZE}
Current approval process: {CURRENT_APPROVAL_PROCESS}
Compliance requirements: {COMPLIANCE_REQUIREMENTS}

Target: {APPROVAL_TARGET}`,
    challenge_categories: ['document management', 'approval workflows', 'quality control', 'compliance'],
    complexity_level: 'complex'
  },
  {
    title: 'Customer Support Efficiency',
    description: 'Improve response time, increase customer satisfaction, and reduce repetitive support tasks',
    industry: null,
    department: 'Customer Service',
    common_roles: ['Customer Service Representative', 'Support Manager', 'Technical Support', 'Help Desk'],
    scenario_template: `Our customer support team is overwhelmed with repetitive inquiries. Current situation:
- Average response time: {RESPONSE_TIME}
- Daily ticket volume: {TICKET_VOLUME}
- {REPEAT_PERCENTAGE}% of tickets are repetitive questions
- Customer satisfaction score: {SATISFACTION_SCORE}
- Team size: {TEAM_SIZE} support agents

Common inquiry types: {COMMON_INQUIRIES}
Support tools: {SUPPORT_TOOLS}
Current knowledge base: {KNOWLEDGE_BASE_STATUS}

Objective: {SUPPORT_OBJECTIVE}`,
    challenge_categories: ['customer support', 'response time', 'automation', 'knowledge management'],
    complexity_level: 'medium'
  },
  {
    title: 'Expense Report Processing Nightmare',
    description: 'Automate expense validation, reduce processing time, and improve accuracy',
    industry: null,
    department: 'Finance',
    common_roles: ['Finance Manager', 'Accountant', 'Expense Coordinator', 'Operations Manager'],
    scenario_template: `Expense report processing is consuming too much time and prone to errors. Current challenges:
- Processing {EXPENSE_VOLUME} reports per month
- Taking {PROCESSING_TIME} per report on average
- {ERROR_RATE}% error rate requiring corrections
- Frequent missing receipts and incomplete information
- Manual data entry and validation

Current process: {CURRENT_EXPENSE_PROCESS}
Expense tools: {EXPENSE_TOOLS}
Common errors: {COMMON_ERRORS}
Approval workflow: {APPROVAL_WORKFLOW}

Goal: {EXPENSE_GOAL}`,
    challenge_categories: ['expense management', 'data processing', 'automation', 'accuracy'],
    complexity_level: 'medium'
  },
  {
    title: 'Project Status Reporting',
    description: 'Automate project updates, improve stakeholder communication, and ensure accurate progress tracking',
    industry: null,
    department: null,
    common_roles: ['Project Manager', 'Team Lead', 'Program Manager', 'Operations Manager'],
    scenario_template: `Creating project status reports is time-consuming and often inconsistent. Current issues:
- Managing {PROJECT_COUNT} active projects
- Spending {REPORTING_TIME} weekly on status reports
- Inconsistent reporting formats across projects
- Difficulty tracking real progress vs. planned progress
- Stakeholders requesting different levels of detail

Current reporting process: {CURRENT_REPORTING}
Project management tools: {PM_TOOLS}
Stakeholder types: {STAKEHOLDER_TYPES}
Reporting frequency: {REPORTING_FREQUENCY}

Desired outcome: {REPORTING_GOAL}`,
    challenge_categories: ['project management', 'reporting', 'communication', 'tracking'],
    complexity_level: 'medium'
  },
  {
    title: 'Sales Lead Management',
    description: 'Improve lead qualification, automate follow-up, and increase conversion rates',
    industry: null,
    department: 'Sales',
    common_roles: ['Sales Representative', 'Sales Manager', 'Business Development', 'Account Manager'],
    scenario_template: `Our sales lead management process needs optimization. Current challenges:
- {LEAD_VOLUME} leads per month to process
- Lead qualification takes {QUALIFICATION_TIME}
- {CONVERSION_RATE}% conversion rate from lead to opportunity
- Inconsistent follow-up schedules
- Poor lead scoring and prioritization

Current lead process: {CURRENT_LEAD_PROCESS}
CRM system: {CRM_SYSTEM}
Sales team size: {SALES_TEAM_SIZE}
Lead sources: {LEAD_SOURCES}

Target: {SALES_TARGET}`,
    challenge_categories: ['sales management', 'lead generation', 'CRM', 'conversion optimization'],
    complexity_level: 'medium'
  },
  {
    title: 'Employee Onboarding Streamlining',
    description: 'Standardize new hire process, reduce onboarding time, and improve new employee experience',
    industry: null,
    department: 'Human Resources',
    common_roles: ['HR Manager', 'HR Coordinator', 'Onboarding Specialist', 'People Operations'],
    scenario_template: `Our employee onboarding process is inconsistent and overwhelming. Current situation:
- Onboarding {NEW_HIRE_VOLUME} employees per month
- Current onboarding duration: {ONBOARDING_DURATION}
- {COMPLETION_RATE}% of new hires complete all onboarding tasks
- Frequent delays in equipment setup and access provisioning
- Inconsistent training delivery across departments

Current onboarding process: {CURRENT_ONBOARDING}
HR tools: {HR_TOOLS}
Departments involved: {DEPARTMENTS}
New hire feedback: {FEEDBACK_SUMMARY}

Goal: {ONBOARDING_GOAL}`,
    challenge_categories: ['HR management', 'onboarding', 'employee experience', 'process standardization'],
    complexity_level: 'complex'
  },
  {
    title: 'Social Media Content Management',
    description: 'Streamline content creation, maintain consistent brand voice, and improve engagement',
    industry: null,
    department: 'Marketing',
    common_roles: ['Marketing Manager', 'Social Media Manager', 'Content Creator', 'Brand Manager'],
    scenario_template: `Managing social media content across multiple platforms is overwhelming. Current challenges:
- Posting on {PLATFORM_COUNT} social media platforms
- Creating {CONTENT_VOLUME} pieces of content per week
- Maintaining consistent brand voice across all content
- Tracking engagement and performance metrics
- Responding to comments and messages in timely manner

Current content process: {CURRENT_CONTENT_PROCESS}
Social media tools: {SOCIAL_TOOLS}
Content types: {CONTENT_TYPES}
Team size: {CONTENT_TEAM_SIZE}

Objective: {CONTENT_OBJECTIVE}`,
    challenge_categories: ['social media', 'content creation', 'brand management', 'engagement'],
    complexity_level: 'medium'
  },
  {
    title: 'Inventory Management Optimization',
    description: 'Automate inventory tracking, reduce stockouts, and optimize reorder points',
    industry: null,
    department: 'Operations',
    common_roles: ['Operations Manager', 'Inventory Manager', 'Supply Chain Coordinator', 'Warehouse Manager'],
    scenario_template: `Our inventory management is causing operational inefficiencies. Current issues:
- Managing {INVENTORY_ITEMS} different SKUs
- {STOCKOUT_FREQUENCY} stockouts per month
- Excess inventory worth {EXCESS_INVENTORY_VALUE}
- Manual inventory counts taking {COUNTING_TIME}
- Poor demand forecasting accuracy

Current inventory system: {CURRENT_INVENTORY_SYSTEM}
Warehouse locations: {WAREHOUSE_LOCATIONS}
Supplier count: {SUPPLIER_COUNT}
Inventory turnover: {TURNOVER_RATE}

Target: {INVENTORY_TARGET}`,
    challenge_categories: ['inventory management', 'supply chain', 'forecasting', 'operations'],
    complexity_level: 'complex'
  }
];

async function seedScenarioTemplates() {
  try {
    for (const template of scenarioTemplates) {
      await pool.query(
        'INSERT INTO scenario_templates (title, description, industry, department, common_roles, scenario_template, challenge_categories, complexity_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          template.title,
          template.description,
          template.industry,
          template.department,
          JSON.stringify(template.common_roles),
          template.scenario_template,
          JSON.stringify(template.challenge_categories),
          template.complexity_level
        ]
      );
      
      console.log(`✓ Seeded template: ${template.title}`);
    }
    
    console.log('\n🎉 All scenario templates seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding scenario templates:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedScenarioTemplates();