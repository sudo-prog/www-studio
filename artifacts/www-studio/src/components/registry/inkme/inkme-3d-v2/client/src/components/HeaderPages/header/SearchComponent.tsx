import * as React from 'react';

function SearchComponent() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSearch = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        setIsOpen(!isOpen);
    };

    const closeSearch = () => {
        setIsOpen(false);
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div onClick={closeSearch}>
            <button className="search-trigger search-icon" onClick={toggleSearch}>
                <i className="fas fa-search"></i>
            </button>
            {isOpen && (
                <div className="search-wrap" style={{ opacity: isOpen ? 1 : 0 }} onClick={stopPropagation}>
                    <div className="search-inner">
                        <i
                            className="fas fa-times search-close"
                            id="search-close"
                            onClick={toggleSearch}
                        ></i>
                        <div className="search-cell">
                            <form method="get">
                                <div className="search-field-holder">
                                    <input type="search" className="main-search-input" placeholder="Search..." />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// export default SearchComponent;
export { SearchComponent as InkMeSearchComponent };
