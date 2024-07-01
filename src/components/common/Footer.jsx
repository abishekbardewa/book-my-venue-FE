import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="bg-white mt-32 shadow md:px-8 lg:px-20 border-t border-gray-50 fixed bottom-0 w-full">
			<div className="w-full  px-4 py-3 ">
				<div className="flex flex-col items-center justify-center  lg:flex-row lg:items-center lg:justify-between">
					<span className="block text-sm text-gray-500 sm:text-center whitespace-nowrap ">
						© {currentYear}{' '}
						<Link to="/" className="hover:underline">
							BookMyVenue
						</Link>
						. All Rights Reserved.
					</span>
					<ul className="flex flex-wrap items-center justify-center text-sm font-medium text-gray-500 mb-0 ">
						<li>
							<Link to="/privacy-policy" className="hover:underline me-4 md:me-6 whitespace-nowrap">
								Privacy Policy
							</Link>
						</li>
						<li>
							<Link to="/terms-of-service" className="hover:underline me-4 md:me-6 whitespace-nowrap">
								Terms of Service
							</Link>
						</li>
						<li>
							<Link to="/cancel-refund-policy" className="hover:underline me-4 md:me-6 whitespace-nowrap">
								Cancelletion & Refund Policy
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
