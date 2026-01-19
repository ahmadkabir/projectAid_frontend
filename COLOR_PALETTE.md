# ProjectAid Brand Color Palette

This document defines the official color palette derived from the ProjectAid logo. **All UI components must use only these colors.**

## Primary Colors

- **Primary Blue**: `#0C3968` - Dark blue, used for primary CTAs, headings, and main brand elements
- **Primary Blue Light**: `#1188C9` - Light blue, used for secondary elements, gradients, and hover states
- **Primary Green**: `#82C53A` - Vibrant green, used for accents, success states, and highlight CTAs
- **Primary Teal**: `#C0D9C7` - Light teal, used for subtle accents and backgrounds

## Neutral Colors

- **Gray Scale**: Standard Tailwind gray scale (gray-50 through gray-900) for:
  - Backgrounds (gray-50, gray-100)
  - Borders (gray-200, gray-300)
  - Text (gray-600, gray-700, gray-900)
  - Shadows and subtle elements

## Usage Guidelines

### Buttons
- Primary buttons: `bg-primary-blue hover:bg-primary-blue-light`
- Secondary/Accent buttons: `bg-primary-green hover:bg-primary-green/90`
- Outline buttons: `border-primary-blue text-primary-blue`

### Text
- Headings: `text-primary-blue`
- Links: `text-primary-blue hover:text-primary-green`
- Body text: `text-gray-600` or `text-gray-700`
- Muted text: `text-gray-500`

### Status Indicators
- Success/Completed: `bg-primary-green/10 text-primary-green`
- Pending/In Progress: `bg-primary-blue-light/10 text-primary-blue-light`
- Open/Active: `bg-primary-blue/10 text-primary-blue`
- Closed/Cancelled: `bg-gray-100 text-gray-800`

### Icons
- Primary icons: `text-primary-blue`
- Accent icons: `text-primary-green`
- Secondary icons: `text-primary-blue-light`
- Muted icons: `text-gray-400` or `text-gray-500`

## Forbidden Colors

**DO NOT USE** the following colors anywhere in the UI:
- ❌ `blue-500`, `blue-600` (use `primary-blue` or `primary-blue-light` instead)
- ❌ `green-600` (use `primary-green` instead)
- ❌ `purple-500`, `purple-600` (use brand colors instead)
- ❌ `yellow-500`, `yellow-600` (use `primary-blue-light` for warnings/in-progress)
- ❌ `red-500`, `red-600` (use `primary-blue-light` or `gray` for negative states)
- ❌ Any other non-brand colors

## Tailwind Classes

Use these Tailwind classes:
- `bg-primary-blue`, `bg-primary-blue-light`, `bg-primary-green`, `bg-primary-teal`
- `text-primary-blue`, `text-primary-blue-light`, `text-primary-green`
- `border-primary-blue`, `border-primary-green`
- `hover:bg-primary-blue-light`, `hover:text-primary-green`
