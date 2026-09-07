import React from "react";
import HeaderS3 from '../../HeaderPages/headerS3/HeaderS3';

// export default function Navbar(props) {
    const [scroll, setScroll] = React.useState(0);

    const handleScroll = () => setScroll(document.documentElement.scrollTop);

    React.useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const className = scroll > 80 ? "fixed-navbar active" : "fixed-navbar";

    return (
        <div className={className}>
            <HeaderS3 hclass={props.hclass} Logo={props.Logo} topbarClass={props.topbarClass} />
        </div>
    );
}
export { Navbar as InkMeNavbar };
