import React from 'react'

function Heading({ name, city , country}) {
    return (
        <>
            <h3 className="font-semibold text-2xl">{name}</h3>
            <h2 className="text-md text-gray-500">{city}, {country}</h2>
        </>
    )
}

export default Heading