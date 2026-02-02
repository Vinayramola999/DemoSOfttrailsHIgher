import React from "react";
import PropTypes from "prop-types";

const Button = ({ children, className,fun, ...props }) => {
    return (
        <button
            className={`bg-blue-500 text-white py-2 px-10 rounded ${className}`}
            onClick={fun}
            {...props}
        >
            {children}
        </button>
    );
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func
};

export default Button;
