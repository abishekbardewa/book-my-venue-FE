import React from 'react';

const EmptyState = ({ title, subtitle, icon }) => {
	return (
		<div className="flex flex-col items-center justify-center h-[60vh]">
			{icon}
			<h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
			<p className="mt-1 text-sm text-gray-100 text-center">{subtitle}</p>
		</div>
	);
};

export default EmptyState;
