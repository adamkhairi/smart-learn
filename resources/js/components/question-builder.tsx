import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, HelpCircle } from 'lucide-react';

interface Question {
    id: string;
    type: 'MCQ' | 'Essay';
    question_text: string;
    points: number;
    choices?: Record<string, string>;
    answer?: string;
    keywords?: string[];
}

interface QuestionBuilderProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    const addQuestion = (type: 'MCQ' | 'Essay') => {
        const newQuestion: Question = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            question_text: '',
            points: 10,
            choices: type === 'MCQ' ? { A: '', B: '', C: '', D: '' } : undefined,
            answer: type === 'MCQ' ? 'A' : undefined,
            keywords: type === 'Essay' ? [] : undefined,
        };

        onChange([...questions, newQuestion]);
        setExpandedQuestion(newQuestion.id);
    };

    const updateQuestion = (questionId: string, updates: Partial<Question>) => {
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
        );
        onChange(updatedQuestions);
    };

    const deleteQuestion = (questionId: string) => {
        const filteredQuestions = questions.filter(q => q.id !== questionId);
        onChange(filteredQuestions);
    };

    const updateChoice = (questionId: string, choiceKey: string, value: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question?.choices) {
            const updatedChoices = { ...question.choices, [choiceKey]: value };
            updateQuestion(questionId, { choices: updatedChoices });
        }
    };

    const updateKeywords = (questionId: string, keywords: string) => {
        const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
        updateQuestion(questionId, { keywords: keywordArray });
    };

    const getTotalPoints = () => {
        return questions.reduce((total, q) => total + q.points, 0);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <p className="text-sm text-muted-foreground">
                        {questions.length} question{questions.length !== 1 ? 's' : ''} • {getTotalPoints()} total points
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('MCQ')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        MCQ
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('Essay')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Essay
                    </Button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
                {questions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h4 className="text-lg font-semibold mb-2">No questions yet</h4>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                Start by adding MCQ or Essay questions to your assessment
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addQuestion('MCQ')}
                                >
                                    Add MCQ Question
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addQuestion('Essay')}
                                >
                                    Add Essay Question
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">
                                            Question {index + 1}
                                        </CardTitle>
                                        <Badge variant={question.type === 'MCQ' ? 'default' : 'secondary'}>
                                            {question.type}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {question.points} points
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpandedQuestion(
                                                expandedQuestion === question.id ? null : question.id
                                            )}
                                        >
                                            {expandedQuestion === question.id ? 'Collapse' : 'Edit'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteQuestion(question.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {question.question_text && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {question.question_text.length > 100
                                            ? question.question_text.substring(0, 100) + '...'
                                            : question.question_text
                                        }
                                    </p>
                                )}
                            </CardHeader>

                            {expandedQuestion === question.id && (
                                <CardContent className="space-y-4">
                                    {/* Question Text */}
                                    <div>
                                        <Label htmlFor={`question-text-${question.id}`}>
                                            Question Text *
                                        </Label>
                                        <Textarea
                                            id={`question-text-${question.id}`}
                                            value={question.question_text}
                                            onChange={(e) => updateQuestion(question.id, {
                                                question_text: e.target.value
                                            })}
                                            placeholder="Enter your question here..."
                                            rows={3}
                                        />
                                    </div>

                                    {/* Points */}
                                    <div className="w-32">
                                        <Label htmlFor={`points-${question.id}`}>Points</Label>
                                        <Input
                                            id={`points-${question.id}`}
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(question.id, {
                                                points: parseInt(e.target.value) || 1
                                            })}
                                        />
                                    </div>

                                    {/* MCQ Options */}
                                    {question.type === 'MCQ' && question.choices && (
                                        <div>
                                            <Label>Answer Choices</Label>
                                            <div className="space-y-2 mt-2">
                                                {Object.entries(question.choices).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-answer-${question.id}`}
                                                            checked={question.answer === key}
                                                            onChange={() => updateQuestion(question.id, { answer: key })}
                                                            className="mt-1"
                                                        />
                                                        <Label className="w-8 text-sm font-medium">
                                                            {key}:
                                                        </Label>
                                                        <Input
                                                            value={value}
                                                            onChange={(e) => updateChoice(question.id, key, e.target.value)}
                                                            placeholder={`Option ${key}`}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Select the radio button for the correct answer
                                            </p>
                                        </div>
                                    )}

                                    {/* Essay Keywords */}
                                    {question.type === 'Essay' && (
                                        <div>
                                            <Label htmlFor={`keywords-${question.id}`}>
                                                Keywords (optional)
                                            </Label>
                                            <Input
                                                id={`keywords-${question.id}`}
                                                value={question.keywords?.join(', ') || ''}
                                                onChange={(e) => updateKeywords(question.id, e.target.value)}
                                                placeholder="keyword1, keyword2, keyword3"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Comma-separated keywords for auto-grading assistance
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
