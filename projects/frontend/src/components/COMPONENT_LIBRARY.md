# CampusChain Frontend Component Library

This document describes the reusable UI components available in the CampusChain frontend.

## Table of Contents
- [Button](#button)
- [Modal](#modal)
- [UIComponentShowcase](#uicomponentshowcase)

---

## Button

**Location**: `src/components/Button.tsx`

A reusable, flexible button component built with DaisyUI and TypeScript.

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: ReactNode
  fullWidth?: boolean
  icon?: ReactNode
}
```

### Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'primary'` | Visual style (primary, secondary, success, error, warning, info, ghost) |
| `size` | string | `'md'` | Button size (xs, sm, md, lg) |
| `loading` | boolean | `false` | Show loading spinner and disable button |
| `disabled` | boolean | `false` | Disable button interaction |
| `children` | ReactNode | - | Button text/content (required) |
| `fullWidth` | boolean | `false` | Stretch button to full container width |
| `icon` | ReactNode | - | Optional icon shown before text |

### Examples

#### Basic Button
```tsx
import Button from './components/Button'

export default function MyComponent() {
  return (
    <Button variant="primary">
      Click Me
    </Button>
  )
}
```

#### Button with Loading State
```tsx
const [loading, setLoading] = useState(false)

const handleClick = async () => {
  setLoading(true)
  try {
    // Perform async action
  } finally {
    setLoading(false)
  }
}

<Button 
  variant="primary" 
  loading={loading}
  onClick={handleClick}
>
  Submit
</Button>
```

#### Button with Icon
```tsx
<Button 
  variant="success" 
  icon="✓"
>
  Confirm Purchase
</Button>
```

#### Full Width Button
```tsx
<Button 
  variant="primary" 
  fullWidth
  onClick={handleBuyTicket}
>
  Buy Ticket
</Button>
```

#### Disabled Button
```tsx
<Button 
  variant="primary" 
  disabled={!isWalletConnected}
>
  Connect Wallet First
</Button>
```

### Variants Visual Guide

- **primary**: Blue button for main actions
- **secondary**: Gray button for alternative actions
- **success**: Green button for confirmations
- **error**: Red button for destructive actions
- **warning**: Amber/yellow button for cautions
- **info**: Light blue button for informational
- **ghost**: Transparent button with border

---

## Modal

**Location**: `src/components/Modal.tsx`

A flexible modal dialog component for displaying content in a dialog overlay.

### Props

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeButton?: boolean
  footer?: ReactNode
}
```

### Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Controls modal visibility (required) |
| `onClose` | function | - | Callback when modal should close (required) |
| `title` | string | - | Modal header title (required) |
| `children` | ReactNode | - | Modal body content (required) |
| `size` | string | `'md'` | Modal width (sm, md, lg, xl) |
| `closeButton` | boolean | `true` | Show X close button in header |
| `footer` | ReactNode | - | Optional footer with action buttons |

### Examples

#### Basic Modal
```tsx
import Modal from './components/Modal'
import { useState } from 'react'

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Dialog Title"
      >
        <p>Your content goes here</p>
      </Modal>
    </>
  )
}
```

#### Modal with Footer Actions
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

#### Modal Sizes
```tsx
// Small modal for confirmation dialogs
<Modal isOpen={isOpen} onClose={onClose} title="Confirm" size="sm">
  <p>Proceed with action?</p>
</Modal>

// Large modal for forms
<Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="lg">
  {/* Form fields */}
</Modal>

// Extra large modal for complex content
<Modal isOpen={isOpen} onClose={onClose} title="Event Details" size="xl">
  {/* Detailed content */}
</Modal>
```

#### Without Close Button
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Important Notice"
  closeButton={false}
  footer={
    <Button variant="primary" onClick={() => setIsOpen(false)}>
      I Understand
    </Button>
  }
>
  <p>Important information that must be acknowledged</p>
</Modal>
```

### Features

- **Keyboard Support**: Press ESC to close (if closeButton is enabled)
- **Click Outside to Close**: Clicking the backdrop closes the modal
- **Scrollable Content**: Long content is automatically scrollable
- **Fixed Header/Footer**: Title and actions remain visible while scrolling
- **Accessible**: Proper ARIA labels and keyboard navigation

---

## UIComponentShowcase

**Location**: `src/components/UIComponentShowcase.tsx`

A demonstration component showcasing all available UI components and their configurations. Use this as a reference when building new features or as a development tool.

### Features

- Live examples of all Button variants and sizes
- Interactive modal demonstrations
- Code snippets for common use cases
- Visual guide for component states

### Usage

Add the showcase to your app routing for development/testing:

```tsx
import UIComponentShowcase from './components/UIComponentShowcase'

// Add to your router or directly in a page
<Route path="/showcase" element={<UIComponentShowcase />} />
```

---

## Integration Examples

### Club Registration Flow
```tsx
import Modal from './components/Modal'
import Button from './components/Button'
import { useState } from 'react'

export function ClubRegistrationFlow() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    try {
      // Call smart contract
      await registerClub()
    } finally {
      setLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button 
        variant="primary"
        onClick={() => setIsOpen(true)}
      >
        Register Club
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Register Your Club"
        size="md"
        footer={
          <>
            <Button 
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              loading={loading}
              onClick={handleRegister}
            >
              Register
            </Button>
          </>
        }
      >
        {/* Form content */}
      </Modal>
    </>
  )
}
```

### Event Actions
```tsx
<div className="flex gap-2">
  <Button 
    variant="success"
    icon="🎫"
    fullWidth
    onClick={handleBuyTicket}
  >
    Buy Ticket
  </Button>
  <Button 
    variant="info"
    onClick={handleViewDetails}
  >
    Details
  </Button>
</div>
```

---

## Styling Customization

All components use DaisyUI classes and can be themed by modifying your `tailwind.config.cjs`:

```javascript
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
```

For custom styling, pass additional className prop:

```tsx
<Button 
  variant="primary" 
  className="shadow-lg hover:shadow-xl"
>
  Custom Styled Button
</Button>
```

---

## Best Practices

### Button Usage
- ✅ Use `variant="primary"` for main call-to-action buttons
- ✅ Use `loading={true}` during async operations
- ✅ Show `disabled={true}` when actions are unavailable
- ❌ Don't use multiple primary buttons in one area
- ❌ Don't overload buttons with too much text

### Modal Usage
- ✅ Use `size="sm"` for simple confirmations
- ✅ Use `size="lg"` or `size="xl"` for forms
- ✅ Always provide clear, descriptive titles
- ✅ Include footer actions for user guidance
- ❌ Don't put modals inside other modals
- ❌ Don't hide critical information in modals

---

## Accessibility

All components follow accessibility best practices:

- **Button**: Proper `disabled` state handling, keyboard support
- **Modal**: 
  - ESC key closes modal
  - Focus trap within modal
  - Close button with `aria-label`
  - Backdrop prevents background interaction

---

## Contributing

When adding new UI components:

1. Create a new file in `src/components/`
2. Export from the component file
3. Add TypeScript interfaces for props
4. Include JSDoc comments for all props
5. Add examples to `UIComponentShowcase.tsx`
6. Update this documentation file

---

## Related Resources

- [DaisyUI Documentation](https://daisyui.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
