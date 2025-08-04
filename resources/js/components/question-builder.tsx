import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Edit3, ChevronUp, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Question {
    id: string;
    type: 'MCQ' | 'TrueFalse' | 'ShortAnswer';
    question_text: string;
    points: number;
    choices?: Record<string, string>;
    answer?: string;
}

interface QuestionBuilderProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    const addQuestion = (type: 'MCQ' | 'TrueFalse' | 'ShortAnswer') => {
        const newQuestion: Question = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            question_text: '',
            points: 10,
            choices: type === 'MCQ' ? { A: '', B: '', C: '', D: '' } : undefined,
            answer: type === 'MCQ' ? 'A' : type === 'TrueFalse' ? 'true' : '',
        };

        onChange([...questions, newQuestion]);
        setExpandedQuestion(newQuestion.id);
    };

    const updateQuestion = (questionId: string, updates: Partial<Question>) => {
        const updatedQuestions = questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q));
        onChange(updatedQuestions);
    };

    const deleteQuestion = (questionId: string) => {
        const filteredQuestions = questions.filter((q) => q.id !== questionId);
        onChange(filteredQuestions);
    };

    const updateChoice = (questionId: string, choiceKey: string, value: string) => {
        const question = questions.find((q) => q.id === questionId);
        if (question?.choices) {
            const updatedChoices = { ...question.choices, [choiceKey]: value };
            updateQuestion(questionId, { choices: updatedChoices });
        }
    };



    const getTotalPoints = () => {
        return questions.reduce((total, q) => total + q.points, 0);
    };

    const getQuestionStatus = (question: Question) => {
        if (!question.question_text.trim()) return 'incomplete';
        if (question.type === 'MCQ' && (!question.answer || !question.choices)) return 'incomplete';
        if (question.type === 'TrueFalse' && (!question.answer || !['true', 'false'].includes(question.answer))) return 'incomplete';
        if (question.type === 'ShortAnswer' && !question.answer?.trim()) return 'incomplete';
        return 'complete';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'complete':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'incomplete':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        Questions Builder
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {questions.length} question{questions.length !== 1 ? 's' : ''} • {getTotalPoints()} total points
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('MCQ')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>MCQ</span>
                        <Badge variant="secondary" className="ml-1">Multiple Choice</Badge>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('TrueFalse')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>True/False</span>
                        <Badge variant="secondary" className="ml-1">True or False</Badge>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('ShortAnswer')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Short Answer</span>
                        <Badge variant="secondary" className="ml-1">Text Input</Badge>
                    </Button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <Card className="border-2 border-dashed border-muted-foreground/20">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Target className="mb-4 h-16 w-16 text-muted-foreground" />
                            <h4 className="mb-2 text-xl font-semibold">No questions yet</h4>
                            <p className="mb-6 text-center text-muted-foreground max-w-md">
                                Start building your assessment by adding questions.
                                Choose from multiple choice, true/false, or short answer questions.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addQuestion('MCQ')}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add MCQ
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addQuestion('TrueFalse')}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add True/False
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addQuestion('ShortAnswer')}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Short Answer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    questions.map((question, index) => {
                        const status = getQuestionStatus(question);
                        const isExpanded = expandedQuestion === question.id;

                        return (
                            <Card key={question.id} className={`transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        Question {index + 1}
                                                        {getStatusIcon(status)}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={question.type === 'MCQ' ? 'default' : 'secondary'}>
                                                            {question.type === 'MCQ' ? 'Multiple Choice' : 
                                                             question.type === 'TrueFalse' ? 'True/False' : 'Short Answer'}
                                                        </Badge>
                                                        <Badge variant="outline">{question.points} points</Badge>
                                                        {status === 'incomplete' && (
                                                            <Badge variant="destructive" className="text-xs">Incomplete</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                                                className="flex items-center gap-1"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4" />
                                                        <span>Collapse</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit3 className="h-4 w-4" />
                                                        <span>Edit</span>
                                                    </>
                                                )}
                                            </Button>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteQuestion(question.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    {question.question_text && (
                                        <div className="mt-3 p-3 bg-muted/30 rounded-md">
                                            <p className="text-sm text-muted-foreground">
                                                {question.question_text.length > 150
                                                    ? question.question_text.substring(0, 150) + '...'
                                                    : question.question_text}
                                            </p>
                                        </div>
                                    )}
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="space-y-6 pt-0">
                                        {/* Question Text */}
                                        <div>
                                            <Label htmlFor={`question-text-${question.id}`} className="text-base font-medium">
                                                Question Text *
                                            </Label>
                                            <Textarea
                                                id={`question-text-${question.id}`}
                                                value={question.question_text}
                                                onChange={(e) =>
                                                    updateQuestion(question.id, {
                                                        question_text: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter your question here..."
                                                rows={4}
                                                className="mt-2"
                                            />
                                        </div>

                                        {/* Points */}
                                        <div className="w-32">
                                            <Label htmlFor={`points-${question.id}`} className="text-base font-medium">
                                                Points
                                            </Label>
                                            <Input
                                                id={`points-${question.id}`}
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={question.points}
                                                onChange={(e) =>
                                                    updateQuestion(question.id, {
                                                        points: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        {/* MCQ Options */}
                                        {question.type === 'MCQ' && question.choices && (
                                            <div>
                                                <Label className="text-base font-medium">Answer Choices</Label>
                                                <div className="mt-3 space-y-3">
                                                    {Object.entries(question.choices).map(([key, value]) => (
                                                        <div key={key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                                            <input
                                                                type="radio"
                                                                name={`correct-answer-${question.id}`}
                                                                checked={question.answer === key}
                                                                onChange={() => updateQuestion(question.id, { answer: key })}
                                                                className="h-4 w-4 text-primary"
                                                            />
                                                            <Label className="w-8 text-sm font-medium text-primary">
                                                                {key}:
                                                            </Label>
                                                            <Input
                                                                value={value}
                                                                onChange={(e) => updateChoice(question.id, key, e.target.value)}
                                                                placeholder={`Option ${key}`}
                                                                className="flex-1"
                                                            />
                                                            {question.answer === key && (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Select the radio button for the correct answer
                                                </p>
                                            </div>
                                        )}

                                        {/* True/False Options */}
                                        {question.type === 'TrueFalse' && (
                                            <div>
                                                <Label className="text-base font-medium">Correct Answer</Label>
                                                <div className="mt-3 space-y-3">
                                                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                                        <input
                                                            type="radio"
                                                            name={`correct-answer-${question.id}`}
                                                            checked={question.answer === 'true'}
                                                            onChange={() => updateQuestion(question.id, { answer: 'true' })}
                                                            className="h-4 w-4 text-primary"
                                                        />
                                                        <Label className="text-sm font-medium">
                                                            True
                                                        </Label>
                                                        {question.answer === 'true' && (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                                        <input
                                                            type="radio"
                                                            name={`correct-answer-${question.id}`}
                                                            checked={question.answer === 'false'}
                                                            onChange={() => updateQuestion(question.id, { answer: 'false' })}
                                                            className="h-4 w-4 text-primary"
                                                        />
                                                        <Label className="text-sm font-medium">
                                                            False
                                                        </Label>
                                                        {question.answer === 'false' && (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Select the correct answer for this true/false question
                                                </p>
                                            </div>
                                        )}

                                        {/* Short Answer */}
                                        {question.type === 'ShortAnswer' && (
                                            <div>
                                                <Label htmlFor={`answer-${question.id}`} className="text-base font-medium">
                                                    Correct Answer *
                                                </Label>
                                                <Input
                                                    id={`answer-${question.id}`}
                                                    value={question.answer || ''}
                                                    onChange={(e) => updateQuestion(question.id, { answer: e.target.value })}
                                                    placeholder="Enter the correct answer..."
                                                    className="mt-2"
                                                />
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Enter the expected answer. The system will provide partial credit for similar answers.
                                                </p>
                                            </div>
                                        )}

                                    </CardContent>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Summary Footer */}
            {questions.length > 0 && (
                <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Total Questions:</span>
                                    <Badge variant="outline">{questions.length}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Total Points:</span>
                                    <Badge variant="outline">{getTotalPoints()}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Complete:</span>
                                    <Badge variant="outline">
                                        {questions.filter(q => getQuestionStatus(q) === 'complete').length}/{questions.length}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
