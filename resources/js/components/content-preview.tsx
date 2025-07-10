import { getContentPreview, hasContent } from '@/lib/content-renderer';
import React, { useMemo } from 'react';

interface ContentData {
    content_html?: string;
    content_json?: string | object;
    content?: string;
}

interface ContentPreviewProps {
    content: ContentData;
    type: 'lecture' | 'assessment' | 'assignment';
    maxLength?: number;
    className?: string;
}

const TYPE_STYLES = {
    lecture: {
        container: 'bg-blue-50 border-blue-200',
        text: 'text-blue-600',
        label: 'text-blue-700',
        labelText: 'Content Preview:',
    },
    assessment: {
        container: 'bg-orange-50 border-orange-200',
        text: 'text-orange-600',
        label: 'text-orange-700',
        labelText: 'Assessment Details:',
    },
    assignment: {
        container: 'bg-red-50 border-red-200',
        text: 'text-red-600',
        label: 'text-red-700',
        labelText: 'Assignment Details:',
    },
};

export const ContentPreview = React.memo<ContentPreviewProps>(function ContentPreview({ content, type, maxLength = 100, className = '' }) {
    // Memoize the content check and preview to avoid recalculating on every render
    const { hasContentValue, preview } = useMemo(() => {
        const hasContentValue = hasContent(content);
        if (!hasContentValue) {
            return { hasContentValue: false, preview: '' };
        }

        const preview = getContentPreview(content, maxLength);
        return { hasContentValue, preview: preview.trim() };
    }, [content, maxLength]);

    // Early return if no content
    if (!hasContentValue || !preview) {
        return null;
    }

    const styles = TYPE_STYLES[type];

    return (
        <div className={`mt-2 rounded border p-2 text-xs ${styles.container} ${className}`}>
            <p className={`mb-1 font-medium ${styles.label}`}>{styles.labelText}</p>
            <p className={`line-clamp-2 ${styles.text}`}>{preview}</p>
        </div>
    );
});

// Separate memoized component for question previews
interface QuestionPreviewProps {
    questions: Array<{
        id: number;
        question_text: string;
        type: string;
        points: number;
    }>;
}

export const QuestionPreview = React.memo<QuestionPreviewProps>(function QuestionPreview({ questions }) {
    // Memoize the question summary to avoid recalculation
    const questionSummary = useMemo(() => {
        if (!questions || questions.length === 0) return null;

        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const questionTypes = [...new Set(questions.map((q) => q.type))];

        return {
            count: questions.length,
            totalPoints,
            types: questionTypes.join(', '),
            previewQuestions: questions.slice(0, 2), // Only show first 2 for preview
        };
    }, [questions]);

    if (!questionSummary) {
        return null;
    }

    return (
        <div className="mt-2 rounded border border-purple-200 bg-purple-50 p-2 text-xs">
            <p className="mb-1 font-medium text-purple-700">
                Questions ({questionSummary.count} total, {questionSummary.totalPoints} points):
            </p>
            <div className="space-y-1">
                {questionSummary.previewQuestions.map((question, index) => (
                    <p key={question.id} className="line-clamp-1 text-purple-600">
                        {index + 1}. {question.question_text.substring(0, 60)}
                        {question.question_text.length > 60 ? '...' : ''}
                    </p>
                ))}
                {questionSummary.count > 2 && <p className="text-purple-500 italic">+ {questionSummary.count - 2} more questions</p>}
            </div>
        </div>
    );
});
