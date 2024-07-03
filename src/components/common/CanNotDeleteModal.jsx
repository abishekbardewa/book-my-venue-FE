import React from 'react';

const CanNotDeleteModal = ({ title, message, onCancel, icon }) => {
	return (
		<>
			<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
				<div className="fixed inset-0 bg-black opacity-50" onClick={onCancel}></div>
				<div className="relative z-10 p-4 bg-white rounded-lg shadow  max-w-md w-full m-4">
					<button
						type="button"
						className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
						data-modal-hide=""
						onClick={onCancel}
					>
						<svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
							<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
						</svg>
						<span className="sr-only">Close modal</span>
					</button>
					<div className="p-4 md:p-5 text-center">
						<div className="flex items-center justify-center mb-5">{icon}</div>
						<h3 className="mb-5 text-lg font-normal text-gray-500">{title}</h3>

						<p className="mb-5 text-gray-700">{message}</p>
					</div>
				</div>
			</div>
		</>
	);
};
export default CanNotDeleteModal;
