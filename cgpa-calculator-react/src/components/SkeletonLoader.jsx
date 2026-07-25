import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = () => {
    return (
        <div className="skeleton-wrapper">
            <div className="skeleton-header">
                <div className="skeleton-title skeleton-pulse"></div>
                <div className="skeleton-badge skeleton-pulse"></div>
            </div>
            <div className="skeleton-list">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="skeleton-item">
                        <div className="skeleton-text-group">
                            <div className="skeleton-text-line skeleton-pulse"></div>
                            <div className="skeleton-text-line short skeleton-pulse"></div>
                        </div>
                        <div className="skeleton-input skeleton-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
