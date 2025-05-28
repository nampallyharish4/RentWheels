import React, { useState, useRef, useEffect } from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { ChevronDown, XCircle, MapPin } from 'lucide-react';

interface SearchableLocationSelectProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  options: string[];
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  control: UseControllerProps<any>['control'];
  name: UseControllerProps<any>['name'];
}

const SearchableLocationSelect: React.FC<SearchableLocationSelectProps> = ({
  label,
  options,
  placeholder,
  error,
  leftIcon,
  id,
  control,
  name,
  ...props
}) => {
  const { field } = useController({
    name,
    control,
    defaultValue: '',
  });

  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (field.value) {
      setFilteredOptions(
        options.filter((option) =>
          option.toLowerCase().includes(field.value.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [field.value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    field.onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-secondary-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-500">
            {leftIcon}
          </div>
        )}
        <input
          ref={field.ref}
          id={id}
          type="text"
          className={`
              block w-full rounded-md border-0 py-2.5 transition-colors duration-200
              ${leftIcon ? 'pl-10' : 'pl-4'}
              pr-10
              ${
                error
                  ? 'ring-2 ring-red-500'
                  : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
              }
              shadow-sm
              disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
            `}
          placeholder={placeholder}
          value={field.value}
          onChange={handleInputChange}
          onBlur={field.onBlur}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          {...props}
        />
        {field.value && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-secondary-500"
            onClick={() => field.onChange('')}
          >
            <XCircle size={18} />
          </div>
        )}
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="cursor-pointer select-none relative py-2 pl-10 pr-4 hover:bg-primary-100 hover:text-primary-900"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SearchableLocationSelect;
