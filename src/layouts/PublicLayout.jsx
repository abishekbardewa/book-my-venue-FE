// PublicLayout.jsx
import React from 'react';
import Navbar from '../components/navbar/Navbar';
import { Outlet } from 'react-router';
import Footer from '../components/common/Footer';
import Categories from '../components/common/Categories';

const PublicLayout = () => {
	return (
		<div className="flex flex-col justify-between">
			<Navbar />
			
			<div >
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};

export default PublicLayout;
