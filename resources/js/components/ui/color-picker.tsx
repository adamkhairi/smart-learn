import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './dialog';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
    error?: string;
    className?: string;
}

const PRESET_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#F43F5E', '#8B5A2B', '#059669', '#DC2626', '#7C3AED',
    '#0891B2', '#65A30D', '#EA580C', '#BE185D', '#4F46E5'
];

export function ColorPicker({ value, onChange, label, error, className }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    // Update input value when prop value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleColorSelect = (color: string) => {
        onChange(color);
        setInputValue(color);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Validate hex color format
        if (/^#[0-9A-F]{6}$/i.test(newValue)) {
            onChange(newValue);
        }
    };

    const handleInputBlur = () => {
        // If input is not a valid hex color, revert to current value
        if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
            setInputValue(value);
        }
    };

    const generateRandomColor = () => {
        const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
        handleColorSelect(randomColor);
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label>{label}</Label>}

            <div className="flex items-center gap-2">
                {/* Color Preview */}
                <div
                    className="h-10 w-10 rounded-lg border-2 border-border shadow-sm flex-shrink-0"
                    style={{ backgroundColor: value || '#f3f4f6' }}
                />

                {/* Color Input */}
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#3B82F6"
                    className="font-mono text-sm flex-1"
                />

                {/* Color Picker Dialog */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                        >
                            <Palette className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-80">
                        <DialogHeader>
                            <DialogTitle>Choose Color</DialogTitle>
                            <DialogDescription>
                                Select a color for the course icon or enter a custom hex code.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Select a color</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={generateRandomColor}
                                >
                                    Random
                                </Button>
                            </div>

                            {/* Preset Colors Grid */}
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn(
                                            "h-10 w-10 rounded-lg border-2 transition-all hover:scale-110",
                                            value === color ? "border-foreground" : "border-border"
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => handleColorSelect(color)}
                                    >
                                        {value === color && (
                                            <Check className="h-4 w-4 text-white m-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Color Input */}
                            <div className="space-y-2">
                                <Label className="text-xs">Custom Color</Label>
                                <Input
                                    type="color"
                                    value={value}
                                    onChange={(e) => handleColorSelect(e.target.value)}
                                    className="h-10 w-full cursor-pointer"
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
