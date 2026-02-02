import React from "react";
import PropTypes from "prop-types";
// import "@fontsource/dm-sans";
// import "@fontsource/poppins";

const Text = ({ children, fun,className, variant, size, weight, align, decor, ff, ...props }) => {
    
    // Define the styles for each category
    const variants = {
        primary: "text-gray-600 tracking-normal",
        secondary: "text-black tracking-normal",
        labels: "text-blue-600 tracking-normal",
        txtnm: "text-gray-500 text-left items-center",
        lbllight: "leading-5 tracking-wider text-blue-400",
        link: "text-blue-500 tracking-normal",
        imp: "inline text-red-500",
        // Add more variants as needed
    };
    
    const sizes = {
        xs: "text-xs", // 12px
        sm: "text-sm", // 14px
        base: "text-base", // 16px
        lg: "text-lg", // 18px
        // Add more sizes as needed
    };
    
    const weights = {
        n: "font-normal", // 400
        m: "font-medium",
        sb: "font-semibold", // 600
        b: "font-bold", // 700
        xb: "font-extrabold",
        // Add more weights as needed
    };
    
    const alignment = {
        c: "text-center",
        l: "text-left",
        r: "text-right",
    }
    
    const decorations = {
        un:"no-underline",
        u: "underline underline-offset-8",
        
    };

    const ffam = {
        dS: "'DM Sans', sans-serif",
        p: "'Poppins', sans-serif",
    };

    // Determine which style to apply based on the provided props
    const textStyle = `${variants[variant] || ""} ${sizes[size] || ""} ${weights[weight] || ""} ${alignment[align]} ${decorations[decor]} ${ffam[ff]} ${className || ""}`;

    return (
        <p onClick={fun} className={textStyle} {...props}>
            {children}
        </p>
    );
};

Text.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    variant: PropTypes.oneOf(["primary", "secondary", "labels", "txtnm", "lbllight", "link", "imp"]),
    size: PropTypes.oneOf(["xs", "sm", "base", "lg"]),
    weight: PropTypes.oneOf(["n", "sb", "m", "b", "xb"]),
    align: PropTypes.oneOf(["c", "l", "r"]),
    decor: PropTypes.oneOf(["u"]),
    ff: PropTypes.oneOf(["p", "dS"]),
};

Text.defaultProps = {
    variant: "primary",
    size: "base",
    weight: "n",
    decor: "",
    align: "c",
    ff: "dS",
};

export default Text;
