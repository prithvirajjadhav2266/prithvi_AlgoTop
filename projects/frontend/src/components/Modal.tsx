import React, { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeButton?: boolean
  footer?: ReactNode
}

/**
 * Reusable Modal Component
 * 
 * A flexible modal dialog component built with DaisyUI.
 * Supports multiple sizes, custom content, and optional footer actions.
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback when modal should close
 * @param title - Modal header title
 * @param children - Modal body content
 * @param size - Modal width (sm, md, lg, xl) - default: md
 * @param closeButton - Show close button in header - default: true
 * @param footer - Optional footer with action buttons
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
  footer,
}) => {
  // Map size prop to DaisyUI modal-box max-width classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  // Handle escape key press to close modal
  const handleEscapeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <dialog 
      className={`modal ${isOpen ? 'modal-open' : ''}`}
      onKeyDown={handleEscapeKeyDown}
    >
      <div className={`modal-box ${sizeClasses[size]}`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-primary">{title}</h3>
          {closeButton && (
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="py-4 max-h-96 overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer (optional) */}
        {footer && (
          <div className="modal-action border-t border-base-300 pt-4 mt-4">
            {footer}
          </div>
        )}

        {/* Backdrop - click outside to close */}
        {isOpen && (
          <form method="dialog" className="modal-backdrop cursor-pointer">
            <button onClick={onClose} type="button" />
          </form>
        )}
      </div>
    </dialog>
  )
}

export default Modal
