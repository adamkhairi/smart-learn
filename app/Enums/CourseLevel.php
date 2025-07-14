<?php

namespace App\Enums;

enum CourseLevel: string
{
    case BEGINNER = 'Beginner';
    case INTERMEDIATE = 'Intermediate';
    case ADVANCED = 'Advanced';
    case ALL_LEVELS = 'All Levels';
}
