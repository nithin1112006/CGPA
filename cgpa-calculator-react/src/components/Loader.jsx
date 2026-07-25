import React from 'react';

const Loader = ({ show }) => {
    return (
        <div id="loader" className={show ? 'show' : ''}>
            <div className="spinner"></div>
        </div>
    );
};

export default Loader;
