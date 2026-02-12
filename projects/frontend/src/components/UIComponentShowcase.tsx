import React from 'react'
import Modal from './Modal'
import Button from './Button'

/**
 * UI Components Showcase
 * 
 * This component demonstrates all available reusable UI components
 * and their various configurations. Use this as a reference when
 * building new features.
 */
export default function UIComponentShowcase() {
  const [showModal, setShowModal] = React.useState(false)
  const [modalSize, setModalSize] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('md')

  const handleOpenModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    setModalSize(size)
    setShowModal(true)
  }

  return (
    <div className="p-8 bg-base-100 rounded-lg">
      <h1 className="text-3xl font-bold mb-8">UI Components Library</h1>

      {/* Button Showcase */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-primary">Buttons</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Variants:</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="error">Error</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Sizes:</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">States:</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary">Normal</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" fullWidth>
              Full Width Button
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">With Icons:</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" icon="🎫">
              Buy Ticket
            </Button>
            <Button variant="success" icon="✓">
              Confirm
            </Button>
            <Button variant="error" icon="✕">
              Cancel
            </Button>
          </div>
        </div>
      </section>

      {/* Modal Showcase */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-primary">Modals</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Modal Sizes:</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => handleOpenModal('sm')} variant="info">
              Small Modal
            </Button>
            <Button onClick={() => handleOpenModal('md')} variant="info">
              Medium Modal
            </Button>
            <Button onClick={() => handleOpenModal('lg')} variant="info">
              Large Modal
            </Button>
            <Button onClick={() => handleOpenModal('xl')} variant="info">
              Extra Large Modal
            </Button>
          </div>
        </div>

        {/* Modal Example */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Modal Example"
          size={modalSize}
          footer={
            <Button 
              variant="primary" 
              onClick={() => setShowModal(false)}
            >
              Close Modal
            </Button>
          }
        >
          <div className="space-y-4">
            <p>
              This is an example modal dialog. It demonstrates the reusable Modal component
              with customizable size, title, content, and footer actions.
            </p>
            <p className="text-sm text-gray-600">
              Click outside or press ESC to close. You can also click the close button (✕)
              in the top right corner.
            </p>
            <div className="bg-base-200 p-4 rounded">
              <p className="font-mono text-sm">
                Modal Size: <span className="font-bold">{modalSize}</span>
              </p>
            </div>
          </div>
        </Modal>
      </section>

      {/* Usage Guide */}
      <section className="mt-12 p-6 bg-base-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Usage Guide</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Button Component</h3>
            <pre className="bg-base-100 p-4 rounded overflow-x-auto text-sm">
{`import Button from './components/Button'

// Basic usage
<Button variant="primary">Click Me</Button>

// With loading state
<Button variant="primary" loading>
  Processing...
</Button>

// With icon
<Button variant="success" icon="✓">
  Confirm
</Button>

// Full width button
<Button fullWidth variant="primary">
  Submit
</Button>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Modal Component</h3>
            <pre className="bg-base-100 p-4 rounded overflow-x-auto text-sm">
{`import Modal from './components/Modal'

// Basic usage
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
>
  <p>Modal content here</p>
</Modal>

// With footer actions
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="sm"
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
