import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      text: 'Completed',
      bg: 'bg-green-500/10',
      textColor: 'text-green-400',
      border: 'border-green-500/20',
      iconColor: 'text-green-400'
    },
    processing: {
      icon: Loader,
      text: 'Processing',
      bg: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      border: 'border-yellow-500/20',
      iconColor: 'text-yellow-400',
      animated: true
    },
    pending: {
      icon: Clock,
      text: 'Pending',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    failed: {
      icon: AlertCircle,
      text: 'Failed',
      bg: 'bg-red-500/10',
      textColor: 'text-red-400',
      border: 'border-red-500/20',
      iconColor: 'text-red-400'
    },
    uploaded: {
      icon: CheckCircle,
      text: 'Uploaded',
      bg: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    }
  };

  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      iconSize: 'w-3 h-3',
      textSize: 'text-xs'
    },
    md: {
      padding: 'px-3 py-1',
      iconSize: 'w-4 h-4',
      textSize: 'text-sm'
    },
    lg: {
      padding: 'px-4 py-2',
      iconSize: 'w-5 h-5',
      textSize: 'text-base'
    }
  };

  const config = statusConfig[status] || statusConfig.completed;
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-full border
      ${config.bg} ${config.border} ${sizes.padding}
    `}>
      <Icon className={`
        ${sizes.iconSize} ${config.iconColor}
        ${config.animated ? 'animate-spin' : ''}
      `} />
      <span className={`${sizes.textSize} font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};

export default StatusBadge;