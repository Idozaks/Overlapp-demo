# Teal/Amber CTA Button System

This document describes the design system for buttons that trigger AI/ChatGPT-4o requests in Overlapp.

## Color Tokens

| Token Name | Hex Code | Usage |
|------------|----------|-------|
| `teal-cta` | `#14B8A6` | Default state background |
| `teal-cta-hover` | `#17D4BE` | Hover state background |
| `teal-cta-pressed` | `#0E927F` | Pressed state background |
| `amber-active` | `#FFB547` | Loading state background |
| `amber-active-hover` | `#FFC062` | Loading state hover background |
| `amber-active-pressed` | `#E29C34` | Loading state pressed background |
| `surface` | `#111824` | Dark mode background |

## States

1. **Default State**
   - Background: `teal-cta`
   - Text: White
   - Scale: 1.0

2. **Hover State**
   - Background: `teal-cta-hover`
   - Text: White
   - Scale: 1.04 (applied via animation)

3. **Pressed State**
   - Background: `teal-cta-pressed`
   - Text: White
   - Scale: 0.98 (applied via animation)

4. **Loading State**
   - Background: `amber-active`
   - Text: White
   - Includes 16px centered spinner overlay
   - Scale: 1.0

5. **Disabled State**
   - Opacity: 50%
   - Pointer events: none

## Implementation

The button system is implemented using the GptButton component that handles all states and animations:

```tsx
<GptButton 
  isLoading={isLoading} 
  loadingText="Processing..."
  onClick={handleSubmit}
>
  Ask GPT
</GptButton>
```

## Animation

- **Hover**: Scale up to 1.04x with ease-out animation over 200ms
- **Pressed**: Scale down to 0.98x with ease-out animation over 100ms
- **Loading**: Spinner rotates 360° continuously

## Accessibility

- Buttons maintain accessible contrast ratios in all states
- Loading state clearly communicates processing status
- Disabled state prevents multiple submissions