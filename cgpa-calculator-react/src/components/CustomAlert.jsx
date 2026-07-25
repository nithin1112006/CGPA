import React from 'react';

const CustomAlert = ({ message, show, onClose }) => {
    return (
        <div id="customAlertOverlay" className={show ? 'show' : ''}>
            <div id="customAlert">
                <span id="customAlertMessage">{message}</span>
                <br />
                <button id="alertButton" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default CustomAlert;
