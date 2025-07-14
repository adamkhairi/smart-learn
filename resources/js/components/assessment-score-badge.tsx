import { Badge } from '@/components/ui/badge';

interface AssessmentScoreBadgeProps {
    percentage: number;
}

export function AssessmentScoreBadge({ percentage }: AssessmentScoreBadgeProps) {
    const getScoreBadge = (percentage: number) => {
        if (percentage >= 90) return { text: 'Excellent', variant: 'default' as const, className: 'bg-green-100 text-green-800' };
        if (percentage >= 80) return { text: 'Good', variant: 'default' as const, className: 'bg-blue-100 text-blue-800' };
        if (percentage >= 70) return { text: 'Satisfactory', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Needs Improvement', variant: 'default' as const, className: 'bg-red-100 text-red-800' };
    };

    const scoreBadge = getScoreBadge(percentage);

    return (
        <Badge className={scoreBadge.className}>
            {scoreBadge.text}
        </Badge>
    );
}
