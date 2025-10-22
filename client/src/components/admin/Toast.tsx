import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface ToastProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  duration?: number;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const bgColors = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  warning: 'bg-yellow-50',
  info: 'bg-blue-50',
};

const borderColors = {
  success: 'border-green-200',
  error: 'border-red-200',
  warning: 'border-yellow-200',
  info: 'border-blue-200',
};

const textColors = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export default function Toast({
  show,
  onClose,
  title,
  message,
  type,
  position = 'top-right',
  duration = 5000
}: ToastProps) {
  const Icon = icons[type] || InformationCircleIcon; // Default to info icon if type is invalid

  // Position classes
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'fixed bottom-4 left-4',
  };

  // Animation classes based on position
  const getAnimationClasses = () => {
    switch (position) {
      case 'top-right':
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2",
          enterTo: "translate-y-0 opacity-100 sm:translate-x-0",
        };
      case 'top-left':
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0 sm:translate-y-0 sm:-translate-x-2",
          enterTo: "translate-y-0 opacity-100 sm:translate-x-0",
        };
      case 'top-center':
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0",
          enterTo: "translate-y-0 opacity-100",
        };
      case 'bottom-right':
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2",
          enterTo: "translate-y-0 opacity-100 sm:translate-x-0",
        };
      case 'bottom-left':
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0 sm:translate-y-0 sm:-translate-x-2",
          enterTo: "translate-y-0 opacity-100 sm:translate-x-0",
        };
      case 'bottom-center':
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0",
          enterTo: "translate-y-0 opacity-100",
        };
      default:
        return {
          enter: "transform ease-out duration-300 transition",
          enterFrom: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2",
          enterTo: "translate-y-0 opacity-100 sm:translate-x-0",
        };
    }
  };

  const animationClasses = getAnimationClasses();

  return (
    <Transition
      show={show}
      as={Fragment}
      enter={animationClasses.enter}
      enterFrom={animationClasses.enterFrom}
      enterTo={animationClasses.enterTo}
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`${positionClasses[position]} max-w-lg w-full ${bgColors[type]} border ${borderColors[type]} rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-50`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${iconColors[type]}`} aria-hidden="true" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${textColors[type]}`}>{title}</p>
              {message && (
                <p className={`mt-1 text-sm ${textColors[type]}`}>{message}</p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`rounded-md inline-flex ${textColors[type]} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-opacity`}
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}