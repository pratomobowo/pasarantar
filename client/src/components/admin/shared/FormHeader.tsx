import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  backTo: string;
  backText?: string;
}

export default function FormHeader({ title, subtitle, backTo, backText }: FormHeaderProps) {
  return (
    <div className="flex items-center">
      <Link
        to={backTo}
        className="mr-4 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}