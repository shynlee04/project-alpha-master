/**
 * @fileoverview Prompt Templates Library - Curated Collection
 * @module lib/notes/prompt-templates-data
 * @story 43-05: Prompt Templates Library
 * @created 2026-01-12
 * 
 * Provides a curated library of pre-built prompt templates organized by category.
 * Each template includes EN/VI translations and variable definitions.
 */

import type { CustomSlashCommand, CommandCategory, PromptVariable } from './slash-command-store';

// ============================================================================
// Template Interface
// ============================================================================

export interface PromptTemplate {
    id: string;
    title: string;
    titleVi: string;
    description: string;
    descriptionVi: string;
    prompt: string;
    icon: string;
    category: CommandCategory;
    tags: string[];
    variables?: PromptVariable[];
    enableRefinement?: boolean;
    featured?: boolean; // Show in featured section
    popularity?: number; // For sorting (1-100)
}

// ============================================================================
// Writing Templates
// ============================================================================

const WRITING_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tpl-blog-post',
        title: 'Write Blog Post',
        titleVi: 'Viết Bài Blog',
        description: 'Generate a complete blog post with introduction, body, and conclusion',
        descriptionVi: 'Tạo bài viết blog hoàn chỉnh với phần mở đầu, nội dung và kết luận',
        prompt: 'Write a {{tone}} blog post about "{{topic}}" with the following structure:\n\n## Introduction\n- Hook the reader\n- State the main thesis\n\n## Main Content\n- 3-5 key points with examples\n- Use subheadings for each point\n\n## Conclusion\n- Summarize key takeaways\n- Call to action\n\nTarget length: {{length}} words. Target audience: {{audience}}.',
        icon: 'PenTool',
        category: 'writing',
        tags: ['blog', 'content', 'SEO', 'marketing'],
        featured: true,
        popularity: 95,
        enableRefinement: true,
        variables: [
            {
                name: 'topic',
                label: 'Topic',
                labelVi: 'Chủ đề',
                type: 'textarea',
                placeholder: 'What is your blog post about?',
                required: true,
            },
            {
                name: 'tone',
                label: 'Tone',
                labelVi: 'Giọng điệu',
                type: 'select',
                options: ['professional', 'casual', 'educational', 'entertaining', 'persuasive'],
                defaultValue: 'professional',
            },
            {
                name: 'length',
                label: 'Word Count',
                labelVi: 'Số từ',
                type: 'select',
                options: ['500', '800', '1200', '1500', '2000'],
                defaultValue: '800',
            },
            {
                name: 'audience',
                label: 'Target Audience',
                labelVi: 'Đối tượng mục tiêu',
                type: 'text',
                placeholder: 'e.g., developers, marketers, beginners',
                defaultValue: 'general readers',
            },
        ],
    },
    {
        id: 'tpl-story-outline',
        title: 'Create Story Outline',
        titleVi: 'Tạo Dàn Ý Truyện',
        description: 'Generate a detailed story outline with characters and plot points',
        descriptionVi: 'Tạo dàn ý truyện chi tiết với nhân vật và các điểm cốt truyện',
        prompt: 'Create a {{genre}} story outline for "{{title}}":\n\n## Characters\n- Protagonist: Description and motivation\n- Antagonist: Description and conflict\n- Supporting characters\n\n## Plot Structure\n1. Setup/Introduction\n2. Inciting Incident\n3. Rising Action (3 key events)\n4. Climax\n5. Falling Action\n6. Resolution\n\n## Themes\n- Central theme\n- Sub-themes\n\n## Setting\n- Time and place\n- Atmosphere',
        icon: 'BookOpen',
        category: 'writing',
        tags: ['creative', 'story', 'fiction', 'outline'],
        popularity: 75,
        enableRefinement: true,
        variables: [
            {
                name: 'title',
                label: 'Story Title',
                labelVi: 'Tên truyện',
                type: 'text',
                placeholder: 'Working title for your story',
                required: true,
            },
            {
                name: 'genre',
                label: 'Genre',
                labelVi: 'Thể loại',
                type: 'select',
                options: ['fantasy', 'sci-fi', 'romance', 'thriller', 'mystery', 'horror', 'literary fiction'],
                defaultValue: 'fantasy',
            },
        ],
    },
    {
        id: 'tpl-rewrite-improve',
        title: 'Rewrite & Improve',
        titleVi: 'Viết Lại & Cải Thiện',
        description: 'Improve clarity, flow, and engagement of existing text',
        descriptionVi: 'Cải thiện sự rõ ràng, mạch lạc và thu hút của văn bản',
        prompt: 'Rewrite and improve the following text with focus on:\n- {{focus}}\n- Maintain the original meaning\n- Improve word choice and sentence variety\n- Target tone: {{tone}}\n\nOriginal text:\n{{text}}',
        icon: 'Wand2',
        category: 'writing',
        tags: ['editing', 'improvement', 'rewrite'],
        popularity: 90,
        enableRefinement: true,
        variables: [
            {
                name: 'text',
                label: 'Text to Improve',
                labelVi: 'Văn bản cần cải thiện',
                type: 'textarea',
                placeholder: 'Paste the text you want to improve',
                required: true,
            },
            {
                name: 'focus',
                label: 'Focus Area',
                labelVi: 'Trọng tâm',
                type: 'select',
                options: ['clarity and conciseness', 'engagement and flow', 'professional tone', 'creativity and vivid language', 'simplicity for broader audience'],
                defaultValue: 'clarity and conciseness',
            },
            {
                name: 'tone',
                label: 'Target Tone',
                labelVi: 'Giọng điệu mục tiêu',
                type: 'select',
                options: ['professional', 'friendly', 'academic', 'casual', 'persuasive'],
                defaultValue: 'professional',
            },
        ],
    },
];

// ============================================================================
// Analysis Templates
// ============================================================================

const ANALYSIS_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tpl-swot-analysis',
        title: 'SWOT Analysis',
        titleVi: 'Phân Tích SWOT',
        description: 'Generate comprehensive SWOT analysis for business/project',
        descriptionVi: 'Tạo phân tích SWOT toàn diện cho doanh nghiệp/dự án',
        prompt: 'Perform a comprehensive SWOT analysis for: {{subject}}\n\n## Strengths\n- Internal positive factors\n- Competitive advantages\n\n## Weaknesses\n- Internal negative factors\n- Areas for improvement\n\n## Opportunities\n- External positive factors\n- Market trends and possibilities\n\n## Threats\n- External negative factors\n- Competitive and market risks\n\n## Strategic Recommendations\n- How to leverage strengths\n- How to address weaknesses\n- How to capture opportunities\n- How to mitigate threats',
        icon: 'Target',
        category: 'analysis',
        tags: ['business', 'strategy', 'SWOT', 'planning'],
        featured: true,
        popularity: 88,
        enableRefinement: true,
        variables: [
            {
                name: 'subject',
                label: 'Subject of Analysis',
                labelVi: 'Đối tượng phân tích',
                type: 'textarea',
                placeholder: 'Describe your business, project, or idea',
                required: true,
            },
        ],
    },
    {
        id: 'tpl-competitor-analysis',
        title: 'Competitor Analysis',
        titleVi: 'Phân Tích Đối Thủ',
        description: 'Analyze competitors and identify market positioning',
        descriptionVi: 'Phân tích đối thủ cạnh tranh và xác định vị thế thị trường',
        prompt: 'Conduct a competitor analysis for {{company}} in the {{industry}} industry.\n\nAnalyze the following competitors: {{competitors}}\n\nFor each competitor, provide:\n1. Company Overview\n2. Products/Services\n3. Pricing Strategy\n4. Target Market\n5. Strengths\n6. Weaknesses\n\n## Competitive Positioning Map\nPosition based on key factors\n\n## Opportunities for Differentiation\nHow {{company}} can stand out',
        icon: 'Users',
        category: 'analysis',
        tags: ['business', 'competition', 'market', 'strategy'],
        popularity: 78,
        enableRefinement: true,
        variables: [
            {
                name: 'company',
                label: 'Your Company',
                labelVi: 'Công ty của bạn',
                type: 'text',
                placeholder: 'Your company name',
                required: true,
            },
            {
                name: 'industry',
                label: 'Industry',
                labelVi: 'Ngành',
                type: 'text',
                placeholder: 'e.g., SaaS, e-commerce, healthcare',
                required: true,
            },
            {
                name: 'competitors',
                label: 'Competitors',
                labelVi: 'Đối thủ',
                type: 'textarea',
                placeholder: 'List competitor names, separated by commas',
                required: true,
            },
        ],
    },
    {
        id: 'tpl-data-insights',
        title: 'Data Insights Report',
        titleVi: 'Báo Cáo Phân Tích Dữ Liệu',
        description: 'Extract insights and patterns from data description',
        descriptionVi: 'Trích xuất thông tin chi tiết và mẫu từ mô tả dữ liệu',
        prompt: 'Analyze the following data and provide insights:\n\n{{data}}\n\n## Key Findings\n- Top 3-5 significant patterns or trends\n- Statistical highlights\n\n## Analysis\n- What the data reveals\n- Correlations and relationships\n- Anomalies or outliers\n\n## Recommendations\n- Actionable insights\n- Areas for deeper investigation\n\n## Visualization Suggestions\n- Recommended charts or graphs',
        icon: 'Brain',
        category: 'analysis',
        tags: ['data', 'insights', 'analytics', 'report'],
        popularity: 72,
        enableRefinement: true,
        variables: [
            {
                name: 'data',
                label: 'Data Description',
                labelVi: 'Mô tả dữ liệu',
                type: 'textarea',
                placeholder: 'Describe your data, metrics, or paste summary statistics',
                required: true,
            },
        ],
    },
];

// ============================================================================
// Productivity Templates
// ============================================================================

const PRODUCTIVITY_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tpl-project-plan',
        title: 'Create Project Plan',
        titleVi: 'Tạo Kế Hoạch Dự Án',
        description: 'Generate structured project plan with milestones and tasks',
        descriptionVi: 'Tạo kế hoạch dự án có cấu trúc với các mốc quan trọng và nhiệm vụ',
        prompt: 'Create a project plan for: {{project}}\n\nTimeline: {{duration}}\nTeam size: {{team_size}}\n\n## Project Overview\n- Objective and scope\n- Success criteria\n\n## Phases & Milestones\n| Phase | Duration | Key Deliverables |\n|-------|----------|------------------|\n\n## Task Breakdown\nFor each phase, list:\n- [ ] Task name - Owner - Duration - Dependencies\n\n## Risk Assessment\n- Potential risks and mitigation strategies\n\n## Resource Requirements\n- People, tools, budget considerations',
        icon: 'ListTodo',
        category: 'productivity',
        tags: ['planning', 'project', 'management', 'tasks'],
        featured: true,
        popularity: 92,
        enableRefinement: true,
        variables: [
            {
                name: 'project',
                label: 'Project Description',
                labelVi: 'Mô tả dự án',
                type: 'textarea',
                placeholder: 'Describe your project goals and scope',
                required: true,
            },
            {
                name: 'duration',
                label: 'Timeline',
                labelVi: 'Thời gian',
                type: 'select',
                options: ['1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'],
                defaultValue: '1 month',
            },
            {
                name: 'team_size',
                label: 'Team Size',
                labelVi: 'Quy mô đội',
                type: 'select',
                options: ['1 (solo)', '2-3 people', '4-6 people', '7-10 people', '10+ people'],
                defaultValue: '2-3 people',
            },
        ],
    },
    {
        id: 'tpl-meeting-agenda',
        title: 'Meeting Agenda',
        titleVi: 'Chương Trình Họp',
        description: 'Create structured meeting agenda with time allocation',
        descriptionVi: 'Tạo chương trình họp có cấu trúc với phân bổ thời gian',
        prompt: 'Create a meeting agenda for: {{meeting_purpose}}\n\nMeeting duration: {{duration}}\nAttendees: {{attendees}}\n\n## Meeting Details\n- **Date/Time**: [To be filled]\n- **Location/Link**: [To be filled]\n- **Facilitator**: [To be filled]\n\n## Agenda Items\n| # | Topic | Time | Owner | Outcome |\n|---|-------|------|-------|--------|\n| 1 | Opening & Check-in | 5 min | Facilitator | - |\n| 2 | ... | ... | ... | ... |\n\n## Pre-Meeting Preparation\n- Materials to review\n- Questions to consider\n\n## Action Items Template\n| Action | Owner | Due Date |\n|--------|-------|----------|\n\n## Notes Section\n[Space for meeting notes]',
        icon: 'Users',
        category: 'productivity',
        tags: ['meeting', 'agenda', 'collaboration', 'planning'],
        popularity: 85,
        enableRefinement: true,
        variables: [
            {
                name: 'meeting_purpose',
                label: 'Meeting Purpose',
                labelVi: 'Mục đích cuộc họp',
                type: 'text',
                placeholder: 'e.g., Sprint planning, quarterly review, brainstorming',
                required: true,
            },
            {
                name: 'duration',
                label: 'Duration',
                labelVi: 'Thời lượng',
                type: 'select',
                options: ['15 minutes', '30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours'],
                defaultValue: '1 hour',
            },
            {
                name: 'attendees',
                label: 'Attendees',
                labelVi: 'Người tham dự',
                type: 'textarea',
                placeholder: 'List the attendees or roles',
            },
        ],
    },
    {
        id: 'tpl-weekly-review',
        title: 'Weekly Review',
        titleVi: 'Đánh Giá Tuần',
        description: 'Structured weekly review and planning template',
        descriptionVi: 'Mẫu đánh giá và lập kế hoạch tuần có cấu trúc',
        prompt: 'Generate a weekly review template for the week of {{week}}.\n\n## Accomplishments\n- [ ] What did I complete this week?\n- [ ] What went well?\n\n## Challenges\n- What obstacles did I face?\n- What didn\'t get done and why?\n\n## Learnings\n- What did I learn?\n- What would I do differently?\n\n## Metrics/KPIs\n| Metric | Target | Actual | Notes |\n|--------|--------|--------|-------|\n\n## Next Week\'s Focus\n### Top 3 Priorities\n1. \n2. \n3. \n\n### Other Tasks\n- [ ] \n\n## Personal Wellbeing\n- Energy level: /10\n- Work-life balance: /10\n- One thing to improve:',
        icon: 'Target',
        category: 'productivity',
        tags: ['review', 'planning', 'weekly', 'reflection'],
        popularity: 80,
        enableRefinement: true,
        variables: [
            {
                name: 'week',
                label: 'Week',
                labelVi: 'Tuần',
                type: 'text',
                placeholder: 'e.g., Jan 8-12, 2026',
                required: true,
            },
        ],
    },
];

// ============================================================================
// Communication Templates
// ============================================================================

const COMMUNICATION_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tpl-professional-email',
        title: 'Professional Email',
        titleVi: 'Email Chuyên Nghiệp',
        description: 'Draft professional business email with proper structure',
        descriptionVi: 'Soạn email kinh doanh chuyên nghiệp với cấu trúc phù hợp',
        prompt: 'Write a {{tone}} professional email to {{recipient}} regarding: {{subject}}\n\nContext: {{context}}\n\nThe email should:\n- Have a clear subject line\n- Start with appropriate greeting\n- State the purpose clearly in the first paragraph\n- Provide necessary details/context\n- Include a clear call to action\n- End with professional closing\n\nLength: {{length}}',
        icon: 'MessageSquare',
        category: 'communication',
        tags: ['email', 'professional', 'business', 'communication'],
        featured: true,
        popularity: 96,
        enableRefinement: true,
        variables: [
            {
                name: 'recipient',
                label: 'Recipient',
                labelVi: 'Người nhận',
                type: 'text',
                placeholder: 'e.g., hiring manager, client, colleague',
                required: true,
            },
            {
                name: 'subject',
                label: 'Subject',
                labelVi: 'Tiêu đề',
                type: 'text',
                placeholder: 'What is the email about?',
                required: true,
            },
            {
                name: 'context',
                label: 'Context',
                labelVi: 'Bối cảnh',
                type: 'textarea',
                placeholder: 'Provide any relevant background or details',
            },
            {
                name: 'tone',
                label: 'Tone',
                labelVi: 'Giọng điệu',
                type: 'select',
                options: ['formal', 'professional but friendly', 'casual professional', 'warm and personable'],
                defaultValue: 'professional but friendly',
            },
            {
                name: 'length',
                label: 'Length',
                labelVi: 'Độ dài',
                type: 'select',
                options: ['brief (2-3 sentences)', 'short (1 paragraph)', 'medium (2-3 paragraphs)', 'detailed (4+ paragraphs)'],
                defaultValue: 'medium (2-3 paragraphs)',
            },
        ],
    },
    {
        id: 'tpl-feedback-response',
        title: 'Feedback Response',
        titleVi: 'Phản Hồi Góp Ý',
        description: 'Respond to feedback professionally and constructively',
        descriptionVi: 'Phản hồi góp ý một cách chuyên nghiệp và xây dựng',
        prompt: 'Write a {{tone}} response to the following feedback:\n\n"{{feedback}}"\n\nMy response should:\n- Acknowledge the feedback graciously\n- Address specific points raised\n- {{action}} the suggestions\n- Maintain a professional tone\n- End with appreciation or next steps',
        icon: 'MessageSquare',
        category: 'communication',
        tags: ['feedback', 'response', 'professional', 'communication'],
        popularity: 70,
        enableRefinement: true,
        variables: [
            {
                name: 'feedback',
                label: 'Original Feedback',
                labelVi: 'Góp ý gốc',
                type: 'textarea',
                placeholder: 'Paste the feedback you received',
                required: true,
            },
            {
                name: 'tone',
                label: 'Tone',
                labelVi: 'Giọng điệu',
                type: 'select',
                options: ['appreciative', 'professional', 'diplomatic', 'defensive but polite'],
                defaultValue: 'appreciative',
            },
            {
                name: 'action',
                label: 'How to Handle',
                labelVi: 'Cách xử lý',
                type: 'select',
                options: ['accept and implement', 'partially accept', 'respectfully decline', 'request clarification on'],
                defaultValue: 'accept and implement',
            },
        ],
    },
    {
        id: 'tpl-linkedin-post',
        title: 'LinkedIn Post',
        titleVi: 'Bài Đăng LinkedIn',
        description: 'Create engaging LinkedIn post with hooks and hashtags',
        descriptionVi: 'Tạo bài đăng LinkedIn thu hút với hook và hashtag',
        prompt: 'Create a {{style}} LinkedIn post about: {{topic}}\n\nThe post should:\n- Start with an attention-grabbing hook (first line is crucial!)\n- Tell a story or share an insight\n- Provide value to the reader\n- End with a question or call to action to encourage engagement\n- Include 3-5 relevant hashtags\n\nLength: {{length}}\nTone: {{tone}}',
        icon: 'Globe',
        category: 'communication',
        tags: ['linkedin', 'social', 'networking', 'personal brand'],
        popularity: 82,
        enableRefinement: true,
        variables: [
            {
                name: 'topic',
                label: 'Topic',
                labelVi: 'Chủ đề',
                type: 'textarea',
                placeholder: 'What do you want to share?',
                required: true,
            },
            {
                name: 'style',
                label: 'Post Style',
                labelVi: 'Phong cách',
                type: 'select',
                options: ['thought leadership', 'personal story', 'industry insight', 'career advice', 'celebration/announcement'],
                defaultValue: 'thought leadership',
            },
            {
                name: 'tone',
                label: 'Tone',
                labelVi: 'Giọng điệu',
                type: 'select',
                options: ['professional', 'conversational', 'inspiring', 'educational', 'humorous'],
                defaultValue: 'conversational',
            },
            {
                name: 'length',
                label: 'Length',
                labelVi: 'Độ dài',
                type: 'select',
                options: ['short (under 100 words)', 'medium (100-200 words)', 'long (200-300 words)'],
                defaultValue: 'medium (100-200 words)',
            },
        ],
    },
];

// ============================================================================
// Technical Templates
// ============================================================================

const TECHNICAL_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tpl-code-review',
        title: 'Code Review',
        titleVi: 'Đánh Giá Code',
        description: 'Perform comprehensive code review with suggestions',
        descriptionVi: 'Thực hiện đánh giá code toàn diện với đề xuất',
        prompt: 'Review the following {{language}} code:\n\n```{{language}}\n{{code}}\n```\n\nProvide feedback on:\n\n## Code Quality\n- Readability and maintainability\n- Naming conventions\n- Code structure\n\n## Potential Issues\n- Bugs or logic errors\n- Edge cases not handled\n- Performance concerns\n\n## Best Practices\n- Design patterns applied/missing\n- {{focus}} considerations\n\n## Suggestions\n- Specific improvements with code examples\n- Refactoring recommendations\n\n## Summary\n- Overall assessment (1-10)\n- Top 3 action items',
        icon: 'Code',
        category: 'technical',
        tags: ['code', 'review', 'development', 'quality'],
        featured: true,
        popularity: 89,
        enableRefinement: true,
        variables: [
            {
                name: 'code',
                label: 'Code to Review',
                labelVi: 'Code cần đánh giá',
                type: 'textarea',
                placeholder: 'Paste your code here',
                required: true,
            },
            {
                name: 'language',
                label: 'Language',
                labelVi: 'Ngôn ngữ',
                type: 'select',
                options: ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c++', 'other'],
                defaultValue: 'typescript',
            },
            {
                name: 'focus',
                label: 'Focus Area',
                labelVi: 'Trọng tâm',
                type: 'select',
                options: ['security', 'performance', 'testing', 'accessibility', 'general'],
                defaultValue: 'general',
            },
        ],
    },
    {
        id: 'tpl-api-documentation',
        title: 'API Documentation',
        titleVi: 'Tài Liệu API',
        description: 'Generate comprehensive API documentation',
        descriptionVi: 'Tạo tài liệu API toàn diện',
        prompt: 'Create API documentation for: {{endpoint}}\n\nMethod: {{method}}\nDescription: {{description}}\n\n## Endpoint\n`{{method}} {{endpoint}}`\n\n## Description\n[Detailed description of what this endpoint does]\n\n## Authentication\n[Required authentication method]\n\n## Request\n### Headers\n| Header | Type | Required | Description |\n|--------|------|----------|-------------|\n\n### Parameters\n| Name | Type | Required | Description |\n|------|------|----------|-------------|\n\n### Request Body\n```json\n{\n  // Request body schema\n}\n```\n\n## Response\n### Success Response (200)\n```json\n{\n  // Success response example\n}\n```\n\n### Error Responses\n| Code | Message | Description |\n|------|---------|-------------|\n\n## Examples\n### cURL\n```bash\ncurl -X {{method}} ...\n```\n\n### JavaScript\n```javascript\nfetch(...)\n```',
        icon: 'FileCode',
        category: 'technical',
        tags: ['api', 'documentation', 'development', 'reference'],
        popularity: 76,
        enableRefinement: true,
        variables: [
            {
                name: 'endpoint',
                label: 'Endpoint Path',
                labelVi: 'Đường dẫn Endpoint',
                type: 'text',
                placeholder: 'e.g., /api/v1/users',
                required: true,
            },
            {
                name: 'method',
                label: 'HTTP Method',
                labelVi: 'Phương thức HTTP',
                type: 'select',
                options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                defaultValue: 'GET',
            },
            {
                name: 'description',
                label: 'Brief Description',
                labelVi: 'Mô tả ngắn',
                type: 'textarea',
                placeholder: 'What does this endpoint do?',
                required: true,
            },
        ],
    },
    {
        id: 'tpl-debug-help',
        title: 'Debug Helper',
        titleVi: 'Hỗ Trợ Debug',
        description: 'Get help debugging code issues with structured analysis',
        descriptionVi: 'Nhận hỗ trợ debug vấn đề code với phân tích có cấu trúc',
        prompt: 'Help me debug this issue:\n\n## Code\n```{{language}}\n{{code}}\n```\n\n## Expected Behavior\n{{expected}}\n\n## Actual Behavior\n{{actual}}\n\n## Error Message (if any)\n{{error}}\n\n---\n\nPlease provide:\n\n1. **Problem Identification**\n   - What is likely causing this issue?\n\n2. **Root Cause Analysis**\n   - Why is this happening?\n\n3. **Solution**\n   - Step-by-step fix with code examples\n\n4. **Prevention**\n   - How to avoid this in the future',
        icon: 'Zap',
        category: 'technical',
        tags: ['debug', 'troubleshoot', 'fix', 'development'],
        popularity: 84,
        enableRefinement: true,
        variables: [
            {
                name: 'code',
                label: 'Code',
                labelVi: 'Code',
                type: 'textarea',
                placeholder: 'Paste the problematic code',
                required: true,
            },
            {
                name: 'language',
                label: 'Language',
                labelVi: 'Ngôn ngữ',
                type: 'select',
                options: ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c++', 'other'],
                defaultValue: 'typescript',
            },
            {
                name: 'expected',
                label: 'Expected Behavior',
                labelVi: 'Hành vi mong đợi',
                type: 'textarea',
                placeholder: 'What should happen?',
                required: true,
            },
            {
                name: 'actual',
                label: 'Actual Behavior',
                labelVi: 'Hành vi thực tế',
                type: 'textarea',
                placeholder: 'What is actually happening?',
                required: true,
            },
            {
                name: 'error',
                label: 'Error Message',
                labelVi: 'Thông báo lỗi',
                type: 'textarea',
                placeholder: 'Paste any error messages (optional)',
            },
        ],
    },
];

// ============================================================================
// Creative Templates
// ============================================================================

const CREATIVE_TEMPLATES: PromptTemplate[] = [
    {
        id: 'tpl-brainstorm-ideas',
        title: 'Brainstorm Session',
        titleVi: 'Phiên Brainstorm',
        description: 'Generate diverse ideas using multiple thinking techniques',
        descriptionVi: 'Tạo các ý tưởng đa dạng sử dụng nhiều kỹ thuật tư duy',
        prompt: 'Conduct a comprehensive brainstorming session for: {{topic}}\n\nApply these thinking techniques:\n\n## Traditional Brainstorming\n- 10 initial ideas without filtering\n\n## SCAMPER Method\n- **S**ubstitute: What can be replaced?\n- **C**ombine: What can be combined?\n- **A**dapt: What can be adapted?\n- **M**odify: What can be modified?\n- **P**ut to other uses: New applications?\n- **E**liminate: What can be removed?\n- **R**everse: What can be reversed?\n\n## Reverse Brainstorming\n- How could we make this fail?\n- Flip those to positive solutions\n\n## Top 5 Recommendations\n- Best ideas with rationale\n- Feasibility assessment',
        icon: 'Lightbulb',
        category: 'creative',
        tags: ['brainstorm', 'ideas', 'creativity', 'innovation'],
        featured: true,
        popularity: 91,
        enableRefinement: true,
        variables: [
            {
                name: 'topic',
                label: 'Brainstorm Topic',
                labelVi: 'Chủ đề Brainstorm',
                type: 'textarea',
                placeholder: 'What problem or opportunity are you exploring?',
                required: true,
            },
        ],
    },
    {
        id: 'tpl-social-media-content',
        title: 'Social Media Content',
        titleVi: 'Nội Dung Social Media',
        description: 'Create engaging social media content for multiple platforms',
        descriptionVi: 'Tạo nội dung social media thu hút cho nhiều nền tảng',
        prompt: 'Create social media content about: {{topic}}\n\nBrand voice: {{brand_voice}}\nGoal: {{goal}}\n\n## Twitter/X\n- 3 tweet variations (280 chars each)\n- Thread option (5 tweets)\n\n## Instagram\n- Caption (with emojis and hashtags)\n- Story text ideas (3 slides)\n- Carousel post outline (5 slides)\n\n## LinkedIn\n- Professional post version\n- Article teaser\n\n## TikTok/Reels\n- Video script idea (30 seconds)\n- Hook suggestions\n- Trending sound recommendations\n\n## Hashtag Strategy\n- 10-15 relevant hashtags per platform',
        icon: 'Camera',
        category: 'creative',
        tags: ['social media', 'content', 'marketing', 'engagement'],
        popularity: 87,
        enableRefinement: true,
        variables: [
            {
                name: 'topic',
                label: 'Content Topic',
                labelVi: 'Chủ đề nội dung',
                type: 'textarea',
                placeholder: 'What do you want to share?',
                required: true,
            },
            {
                name: 'brand_voice',
                label: 'Brand Voice',
                labelVi: 'Giọng điệu thương hiệu',
                type: 'select',
                options: ['professional', 'playful', 'inspirational', 'educational', 'trendy/Gen-Z'],
                defaultValue: 'professional',
            },
            {
                name: 'goal',
                label: 'Content Goal',
                labelVi: 'Mục tiêu nội dung',
                type: 'select',
                options: ['brand awareness', 'engagement', 'lead generation', 'sales', 'community building'],
                defaultValue: 'engagement',
            },
        ],
    },
    {
        id: 'tpl-presentation-outline',
        title: 'Presentation Outline',
        titleVi: 'Dàn Ý Thuyết Trình',
        description: 'Create structured presentation with compelling narrative',
        descriptionVi: 'Tạo thuyết trình có cấu trúc với câu chuyện hấp dẫn',
        prompt: 'Create a {{duration}} presentation outline for: {{topic}}\n\nAudience: {{audience}}\nGoal: {{goal}}\n\n## Title Slide\n- Compelling title options (3)\n- Subtitle suggestion\n\n## Opening (Hook)\n- Attention-grabbing opening\n- Why this matters to the audience\n\n## Main Content\n### Section 1: [Topic]\n- Key point\n- Supporting evidence/example\n- Visual suggestion\n\n### Section 2: [Topic]\n...\n\n### Section 3: [Topic]\n...\n\n## Conclusion\n- Summary of key points\n- Call to action\n- Memorable closing statement\n\n## Q&A Preparation\n- 5 likely questions and answers\n\n## Speaker Notes\n- Transition phrases between sections\n- Timing suggestions',
        icon: 'Rocket',
        category: 'creative',
        tags: ['presentation', 'slides', 'public speaking', 'storytelling'],
        popularity: 79,
        enableRefinement: true,
        variables: [
            {
                name: 'topic',
                label: 'Presentation Topic',
                labelVi: 'Chủ đề thuyết trình',
                type: 'textarea',
                placeholder: 'What is your presentation about?',
                required: true,
            },
            {
                name: 'duration',
                label: 'Duration',
                labelVi: 'Thời lượng',
                type: 'select',
                options: ['5 minute', '10 minute', '15 minute', '20 minute', '30 minute', '45 minute', '1 hour'],
                defaultValue: '15 minute',
            },
            {
                name: 'audience',
                label: 'Audience',
                labelVi: 'Khán giả',
                type: 'text',
                placeholder: 'Who will be watching? e.g., executives, students, developers',
                required: true,
            },
            {
                name: 'goal',
                label: 'Presentation Goal',
                labelVi: 'Mục tiêu thuyết trình',
                type: 'select',
                options: ['inform', 'persuade', 'inspire', 'teach', 'entertain'],
                defaultValue: 'inform',
            },
        ],
    },
];

// ============================================================================
// All Templates Combined
// ============================================================================

export const ALL_PROMPT_TEMPLATES: PromptTemplate[] = [
    ...WRITING_TEMPLATES,
    ...ANALYSIS_TEMPLATES,
    ...PRODUCTIVITY_TEMPLATES,
    ...COMMUNICATION_TEMPLATES,
    ...TECHNICAL_TEMPLATES,
    ...CREATIVE_TEMPLATES,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: CommandCategory | 'all'): PromptTemplate[] {
    if (category === 'all') {
        return ALL_PROMPT_TEMPLATES;
    }
    return ALL_PROMPT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get featured templates (for homepage/quick access)
 */
export function getFeaturedTemplates(): PromptTemplate[] {
    return ALL_PROMPT_TEMPLATES.filter(t => t.featured).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

/**
 * Search templates by title, description, or tags
 */
export function searchTemplates(query: string): PromptTemplate[] {
    const lowerQuery = query.toLowerCase();
    return ALL_PROMPT_TEMPLATES.filter(t => 
        t.title.toLowerCase().includes(lowerQuery) ||
        t.titleVi.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.descriptionVi.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Get all unique tags across templates
 */
export function getAllTemplateTags(): string[] {
    const tags = new Set<string>();
    ALL_PROMPT_TEMPLATES.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
}

/**
 * Convert template to CustomSlashCommand for importing
 */
export function templateToCommand(template: PromptTemplate): Omit<CustomSlashCommand, 'id' | 'createdAt' | 'updatedAt'> {
    return {
        title: template.title,
        titleVi: template.titleVi,
        description: template.description,
        descriptionVi: template.descriptionVi,
        prompt: template.prompt,
        icon: template.icon,
        aliases: [template.id.replace('tpl-', '')],
        category: template.category,
        tags: template.tags,
        variables: template.variables,
        enableRefinement: template.enableRefinement ?? false,
        isEnabled: true,
    };
}

/**
 * Get template count per category
 */
export function getTemplateCounts(): Record<CommandCategory | 'all', number> {
    const counts: Record<string, number> = { all: ALL_PROMPT_TEMPLATES.length };
    ALL_PROMPT_TEMPLATES.forEach(t => {
        counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts as Record<CommandCategory | 'all', number>;
}
